import os, struct
import cramjam

folder = r"C:\Users\frazm\AppData\Local\Google\Chrome\User Data\Default\Local Extension Settings\dhdgffkkebhmkfjojejmpbldmpobfkfo"

def decompress_ldb(file_path):
    with open(file_path, "rb") as f:
        data = f.read()

    decompressed_data = bytearray()
    if len(data) < 48:
        return bytes()
    
    footer = data[-48:]
    magic = struct.unpack("<Q", footer[-8:])[0]
    if magic != 0xdb4775248b80fb57:
        return data

    def read_varint(buf, offset):
        res = 0
        shift = 0
        while offset < len(buf):
            b = buf[offset]
            offset += 1
            res |= (b & 0x7f) << shift
            if not (b & 0x80):
                break
            shift += 7
        return res, offset

    offset, p = read_varint(footer, 0)
    size, p = read_varint(footer, p)
    idx_offset, p = read_varint(footer, p)
    idx_size, p = read_varint(footer, p)

    idx_block_raw = data[idx_offset:idx_offset+idx_size]
    idx_comp = data[idx_offset+idx_size]
    if idx_comp == 1:
        idx_block = bytes(cramjam.snappy.decompress_raw(idx_block_raw))
    else:
        idx_block = idx_block_raw

    num_restarts = struct.unpack("<I", idx_block[-4:])[0]
    restarts_offset = len(idx_block) - 4 - (num_restarts * 4)

    curr_p = 0
    handles = []
    while curr_p < restarts_offset:
        shared_len, curr_p = read_varint(idx_block, curr_p)
        non_shared, curr_p = read_varint(idx_block, curr_p)
        val_len, curr_p = read_varint(idx_block, curr_p)
        curr_p += non_shared
        val = idx_block[curr_p:curr_p+val_len]
        curr_p += val_len
        b_off, vp = read_varint(val, 0)
        b_sz, vp = read_varint(val, vp)
        handles.append((b_off, b_sz))

    print(f"File {os.path.basename(file_path)}: found {len(handles)} data blocks")
    for b_off, b_sz in handles:
        b_raw = data[b_off:b_off+b_sz]
        b_comp = data[b_off+b_sz]
        if b_comp == 1:
            try:
                b_dec = bytes(cramjam.snappy.decompress_raw(b_raw))
                decompressed_data.extend(b_dec)
            except Exception as e:
                print(f"Decompress error at {b_off}: {e}")
        else:
            decompressed_data.extend(b_raw)

    return bytes(decompressed_data)

all_records = []
for fname in sorted(os.listdir(folder)):
    fp = os.path.join(folder, fname)
    if fname.endswith(".ldb"):
        try:
            dec = decompress_ldb(fp)
            if dec:
                all_records.append(dec)
        except Exception as e:
            print(f"Error processing {fname}: {e}")
    elif fname.endswith(".log"):
        with open(fp, "rb") as f:
            all_records.append(f.read())

total_len = sum(len(r) for r in all_records)
print("Total decompressed bytes:", total_len)

combined = b"\n".join(all_records)
# Find Tampermonkey script sources: "!extdb.@source#"
target = b'!extdb.@source#'
pos = 0
sources = {}
while True:
    idx = combined.find(target, pos)
    if idx == -1:
        break
    uuid_end = combined.find(b'\x01', idx)
    if uuid_end != -1 and uuid_end - idx < 60:
        source_id = combined[idx+len(target):uuid_end].decode('ascii', errors='ignore')
        # find the value
        val_start = combined.find(b'{"origin":"normal","value":"', uuid_end)
        if val_start != -1 and val_start - uuid_end < 50:
            str_start = val_start + len(b'{"origin":"normal","value":"')
            if b'Captcha Solver' in combined[str_start:str_start+2000]:
                print(f"Found Captcha Solver source {source_id} at {str_start}")
                # Find end: next !extdb or end of JSON
                next_tag = combined.find(b'!extdb.', str_start)
                chunk = combined[str_start:next_tag] if next_tag != -1 else combined[str_start:]
                sources[source_id] = chunk
    pos = idx + len(target)

for sid, chunk in sources.items():
    print(f"Candidate {sid}: {len(chunk)} bytes")
    # let's find the closing quote and unescape JSON
    q_end = chunk.rfind(b'"}')
    if q_end == -1:
        q_end = chunk.rfind(b'"')
    if q_end != -1:
        raw_json_str = b'"' + chunk[:q_end] + b'"'
        import json
        try:
            decoded = json.loads(raw_json_str.decode('utf-8', errors='ignore'))
            out_file = rf"extensions\tm_clean_{sid}.js"
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(decoded)
            print(f"Successfully decoded full script to {out_file} ({len(decoded)} chars)")
        except Exception as e:
            print(f"JSON decode failed: {e}")
