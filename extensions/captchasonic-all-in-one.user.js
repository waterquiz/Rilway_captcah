// ==UserScript==

// @name         Captcha Solver – CaptchaSonic / CaptchaAI

// @namespace    https://captchasonic.com/

// @version      0.3.3

// @description  AI-powered automatic captcha solver (Tampermonkey Userscript) for reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile, AWS WAF, GeeTest v3/v4, MtCaptcha, Prosopo, TikTok, Binance, Tencent, and Slide captchas.

// @author       CaptchaSonic / Converted for Tampermonkey

// @match        *://*/*

// @match        https://*/*

// @connect      api.captchasonic.com

// @connect      feedback.captchasonic.com

// @connect      access.captchasonic.com

// @connect      *

// @run-at       document-start

// @grant        GM_setValue

// @grant        GM_getValue

// @grant        GM_deleteValue

// @grant        GM_listValues

// @grant        GM_xmlhttpRequest

// @grant        GM_registerMenuCommand

// @grant        GM_addStyle

// @grant        GM_notification

// @grant        unsafeWindow

// ==/UserScript==



(function () {

  'use strict';



  // ==========================================

  // 1. EMBEDDED CONSTANTS & ASSETS

  // ==========================================

  const VERSION = "0.3.3";

  const DEFAULT_CONFIG = {

  "APIKEY": "sonic_jU643Kvpwrt30TJmkdDSMtpm",

  "ACTIVE": true,

  "THEME": "light",

  "TITLES": [

    "POPULARCAPTCHA",

    "RECAPTCHA2",

    "AWSWAF",

    "BLS",

    "GEETEST",

    "MTCAPTCHA",

    "PROSOPO",

    "TIKTOK",

    "CAPTCHAFOX",

    "BINANCE",

    "TENCENT",

    "SLIDE"

  ],

  "CAPTCHAS": [

    "POPULARCAPTCHA",

    "RECAPTCHA2",

    "AWSWAF",

    "BLS",

    "GEETEST",

    "MTCAPTCHA",

    "PROSOPO",

    "TIKTOK",

    "CAPTCHAFOX",

    "BINANCE",

    "TENCENT",

    "SLIDE"

  ],

  "BLACKLIST": [

    "https://github.com"

  ],

  "BLACKLISTENABLED": false,

  "AUTOOPENENABLED": true,

  "LOGENABLED": true,

  "Local_lang": "en",

  "NOTIFICATION": false,

  "GUIDE_PAGE": true,

  "SolutionCallback": "TestCallback",

  "OPTIONS": {

    "POPULARCAPTCHA": {

      "ENABLED": true,

      "ALWAYSSOLVE": true,

      "AUTOOPEN": true,

      "AUTOSOLVE": true,

      "ENGLISH": true

    },

    "RECAPTCHA2": {

      "ENABLED": true,

      "ALWAYSSOLVE": true,

      "AUTOOPEN": true,

      "AUTOSOLVE": true,

      "METHOD": "RECOGNITION"

    },

    "AWSWAF": {

      "ENABLED": true,

      "AUTOOPEN": true,

      "AUTOSOLVE": true

    },

    "BLS": {

      "ENABLED": true,

      "AUTOOPEN": false,

      "AUTOSOLVE": true

    },

    "GEETEST": {

      "ENABLED": true,

      "AUTOOPEN": true,

      "AUTOSOLVE": true

    },

    "MTCAPTCHA": {

      "ENABLED": true,

      "AUTOSOLVE": true,

      "METHOD": "RECOGNITION"

    },

    "PROSOPO": {

      "ENABLED": true,

      "ALWAYSSOLVE": true,

      "AUTOOPEN": true,

      "AUTOSOLVE": true

    },

    "TIKTOK": {

      "ENABLED": true,

      "ALWAYSSOLVE": true,

      "AUTOSOLVE": true

    },

    "CAPTCHAFOX": {

      "ENABLED": true,

      "AUTOOPEN": true,

      "ALWAYSSOLVE": true,

      "AUTOSOLVE": true

    },

    "BINANCE": {

      "ENABLED": true,

      "ALWAYSSOLVE": true,

      "AUTOSOLVE": true

    },

    "SLIDE": {

      "ENABLED": true,

      "AUTOOPEN": true,

      "ALWAYSSOLVE": true,

      "AUTOSOLVE": true

    },

    "TENCENT": {

      "ENABLED": true,

      "AUTOOPEN": true,

      "ALWAYSSOLVE": true,

      "AUTOSOLVE": true

    }

  },

  "site_configs": {

    "last_updated": "2025-11-08",

    "configs": [

      {

        "websiteUrl": "https://projudi.tjba.jus.br/projudi/",

        "frameSelector": "#tcOperation",

        "selectors": {

          "bgImg": "#slideBg",

          "puzzleImg": "#tcOperation > div:nth-child(8)",

          "dragBtn": ".tc-slider-normal",

          "refreshBtn": "#reload > img"

        },

        "question": "#instructionText"

      },

      {

        "websiteUrl": "https://global.turing.captcha.gtimg.com/",

        "frameSelector": "#tcOperation",

        "selectors": {

          "bgImg": "#slideBg",

          "puzzleImg": "#tcOperation > div:nth-child(8)",

          "dragBtn": ".tc-slider-normal",

          "refreshBtn": "#reload > img"

        },

        "question": "#instructionText"

      }

    ]

  }

};

  const SLIDE_CONFIG = [

  {

    "websiteUrl": "https://open-us.vnnox.com/",

    "frameSelector": ".window-show",

    "selectors": {

      "bgImg": "#aliyunCaptcha-img",

      "puzzleImg": "#aliyunCaptcha-puzzle",

      "dragBtn": "#aliyunCaptcha-sliding-slider",

      "refreshBtn": "#aliyunCaptcha-btn-refresh"

    },

    "question": "#aliyunCaptcha-title"

  },

  {

    "websiteUrl": "https://app.ipfoxy.com",

    "frameSelector": ".window-show",

    "selectors": {

      "bgImg": "#aliyunCaptcha-img",

      "puzzleImg": "#aliyunCaptcha-puzzle",

      "dragBtn": "#aliyunCaptcha-sliding-slider",

      "refreshBtn": "#aliyunCaptcha-btn-refresh"

    },

    "question": "#aliyunCaptcha-title"

  },

  {

    "websiteUrl": "https://kampungjudi33.com/login",

    "frameSelector": ".window-show",

    "selectors": {

      "bgImg": "#aliyunCaptcha-img",

      "puzzleImg": "#aliyunCaptcha-puzzle",

      "dragBtn": "#aliyunCaptcha-sliding-slider",

      "refreshBtn": "#aliyunCaptcha-btn-refresh"

    },

    "question": "#aliyunCaptcha-title"

  }

];

  const EN_MESSAGES = {"CaptchaList":{"message":"Products","title":"Products"},"Balance":{"message":"Balance","title":"Balance"},"Enter_API_KEY":{"message":"Enter your API key here...","title":"Enter your API key here..."},"Available_Balance":{"message":"BALANCE","title":"BALANCE"},"Add_Balance":{"message":"Add Balance","title":"Add Balance"},"Invalid_API":{"message":"Invalid API-KEY","title":"Invalid API-KEY"},"Get_API_key":{"message":"Get API Key","title":"Get API Key"},"Get_Your_API_Key":{"message":"Get Your API-KEY","title":"Get Your API-KEY"},"Credits":{"message":"Credits","title":"Credits"},"DailyUse":{"message":"Daily Limit","title":"Daily Limit"},"Usage_Progress":{"message":"Usage Progress","title":"Usage Progress"},"Add_BlackList_Url":{"message":"BLACKLIST","title":"BLACKLIST"},"Add_URL":{"message":"Block","title":"Block"},"Privacy":{"message":"Privacy","title":"Privacy"},"Updating":{"message":"Loading...","title":"Loading..."},"Remaining":{"message":"remaining","title":"remaining"},"Subcription":{"message":"Buy Subscription!","title":"Buy a Subscription!"},"View_plan":{"message":"view plan","title":"view plan"},"Upgrade_plan":{"message":"upgrade","title":"upgrade"},"Auto_open":{"message":"Auto Open","title":"Auto Open"},"Notification":{"message":"Notification","title":"Notification"},"Expire":{"message":"Expire in","title":"Expire in"},"Refil":{"message":"Refill in","title":"Refill in"},"Limit_Min":{"message":"Limit/Min","title":"Limit/Min"},"Limit_Cnt":{"message":"Limit/Cnt","title":"Limit/Cnt"},"Check_Configuration":{"message":"Check your configuration","title":"Check your configuration"},"No_Internet":{"message":"No Internet Connection","title":"No Internet Connection"},"Expired":{"message":"Expired","title":"Expired"},"On":{"message":"ON","title":"ON"},"Off":{"message":"OFF","title":"OFF"},"Active":{"message":"Active","title":"Active"},"Inactive":{"message":"Inactive","title":"Inactive"},"Loading":{"message":"Loading...","title":"Loading..."},"Open_Dashboard":{"message":"Open Full Dashboard & Analytics","title":"Open Full Dashboard & Analytics"},"Activate":{"message":"Activate","title":"Activate"},"Deactivate":{"message":"Deactivate","title":"Deactivate"},"Enter_Url_Placeholder":{"message":"Enter your URL...","title":"Enter your URL..."},"Url_Removed":{"message":"URL removed!","title":"URL removed!"},"Copied":{"message":"Copied","title":"Copied"},"Could_Not_Copy":{"message":"Could not copy","title":"Could not copy"},"Pasted_From_Clipboard":{"message":"Pasted from clipboard","title":"Pasted from clipboard"},"Could_Not_Paste":{"message":"Could not paste","title":"Could not paste"},"Failed_To_Save_API_Key":{"message":"Failed to save API Key.","title":"Failed to save API Key."},"Remove_API_Key":{"message":"Remove API Key","title":"Remove API Key"},"Paste_API_Key":{"message":"Paste API Key","title":"Paste API Key"},"Copy_API_Key":{"message":"Copy API Key","title":"Copy API Key"},"Solution_Callback":{"message":"Solution Callback","title":"Solution Callback"},"Enter_Callback_Command":{"message":"Enter callback command","title":"Enter callback command"},"System_Active":{"message":"System Active","title":"System Active"},"System_Paused":{"message":"System Paused","title":"System Paused"},"Current_Balance":{"message":"Current Balance","title":"Current Balance"},"Free_Plan":{"message":"Free Plan","title":"Free Plan"},"Monthly_Usage":{"message":"Monthly Usage","title":"Monthly Usage"},"API_Configuration":{"message":"API Configuration","title":"API Configuration"},"Manage":{"message":"Manage","title":"Manage"},"Enter_Api_Key_Placeholder":{"message":"Enter your API Key","title":"Enter your API Key"},"Save":{"message":"Save","title":"Save"},"Api_Key_Safety_Note":{"message":"Your key grants access to your balance. Keep it safe.","title":"Your key grants access to your balance. Keep it safe."},"Automation_Preferences":{"message":"Automation Preferences","title":"Automation Preferences"},"Callback_Function":{"message":"Callback Function","title":"Callback Function"},"Callback_Example":{"message":"e.g. CaptchaVerifiedCallback","title":"e.g. CaptchaVerifiedCallback"},"Callback_Description":{"message":"Executes automatically when a challenge is solved.","title":"Executes automatically when a challenge is solved."},"Auto_Open_Widgets":{"message":"Auto Open Widgets","title":"Auto Open Widgets"},"Auto_Open_Widgets_Desc":{"message":"Automatically open captcha widgets","title":"Automatically open captcha widgets"},"Desktop_Notifications":{"message":"Desktop Notifications","title":"Desktop Notifications"},"Desktop_Notifications_Desc":{"message":"Show native notification on solve","title":"Show native notification on solve"},"Domain_Blacklist":{"message":"Domain Blacklist","title":"Domain Blacklist"},"Blacklist_Disabled":{"message":"Blacklist is disabled","title":"Blacklist is disabled"},"Blacklist_Disabled_Hint":{"message":"Enable to block specific domains","title":"Enable to block specific domains"},"Blacklist_Domain_Placeholder":{"message":"example.com","title":"example.com"},"No_Domains_Added":{"message":"No domains added","title":"No domains added"},"URL_Added":{"message":"URL added","title":"URL added"},"Performance_Overview":{"message":"Performance Overview","title":"Performance Overview"},"Total_Solves":{"message":"Total Solves","title":"Total Solves"},"This_Week":{"message":"this week","title":"this week"},"Success_Rate":{"message":"Success Rate","title":"Success Rate"},"Avg_Time":{"message":"Avg. Time","title":"Avg. Time"},"Vs_Average":{"message":"vs average","title":"vs average"},"Status":{"message":"Status","title":"Status"},"Event":{"message":"Event","title":"Event"},"Description":{"message":"Description","title":"Description"},"Time":{"message":"Time","title":"Time"},"Captcha_Providers":{"message":"Captcha Providers","title":"Captcha Providers"},"Captcha_Providers_Desc":{"message":"Configure which captchas to solve automatically","title":"Configure which captchas to solve automatically"},"System_Events":{"message":"System Events","title":"System Events"},"Advanced_Configuration":{"message":"Advanced Configuration","title":"Advanced Configuration"},"Solving_Captcha":{"message":"Solving captcha","title":"Solving captcha"},"Captcha_Solved":{"message":"Captcha solved!","title":"Captcha solved!"},"Error_Solving_Captcha":{"message":"Error solving captcha","title":"Error solving captcha"},"Processing_Captcha":{"message":"Processing captcha...","title":"Processing captcha..."},"Upgrade_Plan_Action":{"message":"Upgrade Plan","title":"Upgrade Plan"},"Dismiss":{"message":"Dismiss","title":"Dismiss"}};

  const THEMES = {"aw.js":"// if (!window.awsScriptLoaded) {\n//   window.awsScriptLoaded = true;\n\n//   const awsListeningList = [\"/problem\", \"/verify\"];\n\n//   (function () {\n//     var XHR = XMLHttpRequest.prototype;\n\n//     var open = XHR.open;\n//     var send = XHR.send;\n\n//     XHR.open = function (method, url) {\n//       this._method = method;\n//       this._url = url;\n//       return open.apply(this, arguments);\n//     };\n\n//     XHR.send = function (postData) {\n//       const _url = this._url;\n//       this.addEventListener(\"load\", function () {\n//         const isInList = awsListeningList.some(\n//           (url) => _url?.indexOf(url) !== -1\n//         );\n//         if (isInList) {\n//           window.postMessage(\n//             { type: \"xhr\", data: this.response, url: _url, captchaType: \"waf\" },\n//             \"*\"\n//           );\n//         }\n//       });\n\n//       return send.apply(this, arguments);\n//     };\n//   })(XMLHttpRequest);\n\n//   (function () {\n//     let origFetch = window.fetch;\n//     window.fetch = async function (...args) {\n//       const _url = args[0];\n//       const response = await origFetch(...args);\n\n//       response\n//         .clone()\n//         .blob()\n//         .then(async (data) => {\n//           const isInList = awsListeningList.some(\n//             (url) => _url?.indexOf(url) !== -1\n//           );\n//           if (isInList) {\n//             window.postMessage(\n//               {\n//                 type: \"fetch\",\n//                 data: await data.text(),\n//                 url: _url,\n//                 captchaType: \"waf\",\n//               },\n//               \"*\"\n//             );\n//           }\n//         })\n//         .catch((err) => {\n//           console.log(err);\n//         });\n\n//       return response;\n//     };\n//   })();\n// }\n\nif (!window.awsScriptLoaded) {\n  window.awsScriptLoaded = true;\n\n  const awsListeningList = [\"/problem\", \"/verify\"];\n\n  // XMLHttpRequest hook\n  // (function () {\n  //   var XHR = XMLHttpRequest.prototype;\n\n  //   var open = XHR.open;\n  //   var send = XHR.send;\n\n  //   XHR.open = function (method, url) {\n  //     this._method = method;\n  //     this._url = url;\n  //     return open.apply(this, arguments);\n  //   };\n\n  //   XHR.send = function (postData) {\n  //     const _url = this._url;\n\n  //     // Type check for _url\n  //     if (typeof _url !== \"string\") {\n  //       // console.error(\"The URL is not a string:\", _url);\n  //       return send.apply(this, arguments); // Proceed without further processing\n  //     }\n\n  //     this.addEventListener(\"load\", function () {\n  //       const isInList = awsListeningList.some(\n  //         (url) => _url.indexOf(url) !== -1\n  //       );\n  //       if (isInList) {\n  //         console.log(\n  //           { data: this.response, url: _url, captchaType: \"waf\" },\n  //           \"xhr\"\n  //         );\n\n  //         window.postMessage(\n  //           {\n  //             type: \"xhr\",\n  //             data: this.response,\n  //             url: _url,\n  //             captchaType: \"waf\",\n  //           },\n  //           \"*\"\n  //         );\n  //       }\n  //     });\n\n  //     return send.apply(this, arguments);\n  //   };\n  // })(XMLHttpRequest);\n\n  // Fetch hook\n  (function () {\n    let origFetch = window.fetch;\n    // console.log(origFetch, \"origFetch\");\n    window.fetch = async function (...args) {\n      const _url = args[0];\n      // console.log(_url, \"_url\");\n      const response = await origFetch(...args);\n      // console.log(response, \"response\");\n      response\n        .clone()\n        .blob()\n        .then(async (data) => {\n          // console.log(data, await data.text(), \"datadatadatadata\");\n          const isInList = awsListeningList.some(\n            (url) => _url?.indexOf(url) !== -1\n          );\n\n          if (isInList) {\n            window.postMessage(\n              {\n                type: \"fetch\",\n                data: await data.text(),\n                url: _url,\n                captchaType: \"waf\",\n              },\n              \"*\"\n            );\n          }\n        })\n        .catch((err) => {\n          console.log(err);\n        });\n\n      return response;\n    };\n  })();\n}\n\n// (function () {\n//   console.log(\"fetch aws ran\");\n\n//   let origFetch = window.fetch;\n//   window.fetch = async function (...args) {\n//     const _url = args[0];\n\n//     // Type check for _url\n//     if (typeof _url !== \"string\") {\n//       // console.error(\"The URL is not a string:\", _url);\n//       return origFetch(...args); // Proceed without further processing\n//     }\n\n//     // console.log(_url, \"_url\");\n\n//     const response = await origFetch(...args);\n\n//     response\n//       .clone()\n//       .blob()\n//       .then(async (data) => {\n//         const isInList = awsListeningList.some(\n//           (url) => _url.indexOf(url) !== -1\n//         );\n//         if (isInList) {\n//           const payload = {\n//             source: \"regular-dom\",\n//             type: \"fetch\",\n//             data: await data.text(),\n//             url: _url,\n//             captchaType: \"waf\",\n//           };\n//           console.log(data, \"datadatadatadata\");\n\n//           console.log(payload, \"payload\");\n//           window.postMessage(payload, \"*\");\n//           // chrome.runtime.sendMessage({ action: payload });\n//         }\n//       })\n//       .catch((err) => {\n//         console.error(\"Error processing fetch response:\", err);\n//       });\n\n//     return response;\n//   };\n// })();\n// }\n\n// var domain = 'awswaf.com';\n// var awsListeningList = [\n//   '/problem',\n//   '/verify',\n// ];\n\n// (function () {\n//   console.log('fetch aws ran');\n//   var origFetch = window.fetch;\n//   console.log(origFetch, \"origFetch\");\n//   window.fetch = async function (...args) {\n//     console.log(\"in fetch\");\n//     var _url = args[0];\n//     var response = await origFetch(...args);\n//     response\n//       .clone()\n//       .blob()\n//       .then(async data => {\n//         if (_url.indexOf(domain) === -1) return;\n\n//         const domainIndex = _url.indexOf(domain);\n//         const isInList = awsListeningList.some(url => {\n//           if (_url.indexOf(url) === -1) return false;\n//           const urlIndex = _url.indexOf(url);\n\n//           if (domainIndex > urlIndex) return false;\n\n//           return true;\n//         });\n//         if (isInList) {\n//           window.postMessage(\n//             {\n//               type: 'fetch',\n//               data: await data.text(),\n//               url: _url,\n//             },\n//             '*',\n//           );\n//         }\n//       })\n//       .catch(err => {\n//         console.log(err);\n//       });\n\n//     return response;\n//   };\n// })();\n","bls.js":"window.alert = function (message) {\n  console.log(\"Blocked alert: \" + message);\n};\n","captchaFox.js":"let captchafoxListeningList = [\n    \"https://api.captchafox.com/captcha/sk_\"\n  ];\n  \n  (function () {\n    const originalFetch = window.fetch;\n    window.fetch = async function (...args) {\n      const url = args[0];\n  \n      const response = await originalFetch(...args);\n      const cloned = response.clone();\n  \n      try {\n        const isCaptchafox = captchafoxListeningList.some((entry) =>\n          url.includes(entry)\n        );\n  \n        if (isCaptchafox) {\n          const data = await cloned.json(); // Parse JSON from the cloned response\n  \n          window.postMessage(\n            {\n              type: \"fetch\",\n              data: data, // JSON object\n              url,\n              captchaType: \"captchafox\"\n            },\n            \"*\"\n          );\n        }\n      } catch (e) {\n        console.error(\"Error parsing CAPTCHAFOX response:\", e);\n      }\n  \n      return response;\n    };\n  })();\n  ","elementPicker.js":"import TOOLS from \"../../src/tools\";\n\n(async function () {\n  let selectedElement;\n  let ocrid = null;\n\n  let settings = {\n    APIKEY: \"\",\n  };\n\n  function getDomPath(el) {\n    let stack = [];\n    while (el.parentNode != null) {\n      let sibCount = 0;\n      let sibIndex = 0;\n      for (let i = 0; i < el.parentNode.childNodes.length; i++) {\n        let sib = el.parentNode.childNodes[i];\n        if (sib.nodeName == el.nodeName) {\n          if (sib === el) {\n            sibIndex = sibCount;\n          }\n          sibCount++;\n        }\n      }\n      if (el.hasAttribute(\"id\") && el.id != \"\") {\n        stack.unshift(el.nodeName.toLowerCase() + \"#\" + el.id);\n      } else if (sibCount > 1) {\n        stack.unshift(el.nodeName.toLowerCase() + \":eq(\" + sibIndex + \")\");\n      } else {\n        stack.unshift(el.nodeName.toLowerCase());\n      }\n      el = el.parentNode;\n    }\n\n    return stack.slice(1); // removes the html element\n  }\n\n  function getBase64Image(img) {\n    let canvas = document.createElement(\"canvas\");\n    canvas.width = img.width;\n    canvas.height = img.height;\n\n    let ctx = canvas.getContext(\"2d\");\n    ctx.drawImage(img, 0, 0);\n\n    let dataURL = canvas.toDataURL(\"image/png\");\n\n    return dataURL.replace(/^data:image\\/(png|jpg);base64,/, \"\");\n  }\n\n  function getImage() {\n    return new Promise((resolve, reject) => {\n      let img = new Image();\n      img.crossOrigin = \"anonymous\";\n      img.src = selectedElement.src;\n      img.onload = function () {\n        let base64String = getBase64Image(img);\n        resolve(base64String);\n      };\n      img.onerror = function () {\n        reject(new Error(\"Failed to load image\"));\n      };\n    });\n  }\n\n  async function getAnswer(base64Image) {\n    console.log(\"OCRID: \", ocrid);\n    if (ocrid) {\n      try {\n        const response = await new Promise((resolve, reject) => {\n          chrome.runtime.sendMessage({\n            type: \"networkRequest\",\n            payload: {\n              url: \"/createTask\",\n              method: \"POST\",\n              headers: {\n                \"Content-Type\": \"application/json\",\n                apikey: settings.APIKEY,\n              },\n              body: JSON.stringify({\n                method: \"ocr\",\n                id: ocrid,\n                image: base64Image,\n                appid: 0,\n                version: TOOLS.version,\n              }),\n            }\n          }, (res) => {\n            if (chrome.runtime.lastError) {\n              reject(new Error(chrome.runtime.lastError.message));\n            } else {\n              resolve(res);\n            }\n          });\n        });\n\n        if (response && response.success) {\n          console.log(\"result: \", response.data);\n          return response.data;\n        } else {\n          throw new Error(response?.error || \"Request failed\");\n        }\n      } catch (error) {\n        console.log(\"Error: \", error);\n      }\n    }\n  }\n\n  async function solveCaptcha() {\n    let base64Image = await getImage();\n    console.log(\"base64Image: \", base64Image);\n\n    let answer = await getAnswer(base64Image);\n    console.log(\"Answer: \", answer);\n  }\n\n  const highlightElement = (event) => {\n    if (selectedElement) {\n      selectedElement.style.outline = \"\";\n    }\n    selectedElement = event.target;\n    selectedElement.style.outline = \"2px solid red\";\n  };\n\n  const selectElement = async (event) => {\n    console.log(\"clicked\");\n    event.stopPropagation();\n    event.preventDefault();\n    document.body.removeEventListener(\"mouseover\", highlightElement);\n\n    if (selectedElement) {\n      let jsPath = getDomPath(selectedElement);\n      chrome.runtime.sendMessage({ jspath: jsPath });\n      console.log(\"JS Path: \", jsPath);\n      console.log(\"imageurl: \", selectedElement.src);\n      await solveCaptcha();\n      selectedElement.style.outline = \"\";\n      selectedElement = null;\n    }\n  };\n\n  document.body.addEventListener(\"mouseover\", highlightElement, false);\n  document.body.addEventListener(\"click\", selectElement, false);\n  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {\n  //   console.log(\"Received Request: \", request);\n  //   ocrid = request.menuItemId;\n  //   console.log(\"OCRID: \", ocrid);\n  // });\n})();\n","gt.js":"const lemincaptchaListeningList = [\"/load?callback=geetest\"];\n\n(function (xhr) {\n  var XHR = XMLHttpRequest.prototype;\n\n  var open = XHR.open;\n  var send = XHR.send;\n\n  XHR.open = function (method, url) {\n    this._method = method;\n    this._url = url;\n    return open.apply(this, arguments);\n  };\n\n  XHR.send = function (postData) {\n    const _url = this._url;\n    this.addEventListener(\"load\", function () {\n      const isInList = lemincaptchaListeningList.some(\n        (url) => _url.indexOf(url) !== -1\n      );\n      if (isInList) {\n        window.postMessage(\n          { type: \"xhr\", data: this.response, url: _url, captchaType: \"lemin\" },\n          \"*\"\n        );\n      }\n    });\n\n    return send.apply(this, arguments);\n  };\n})(XMLHttpRequest);\n\n(function () {\n  let origFetch = window.fetch;\n  window.fetch = async function (...args) {\n    const _url = args[0];\n    const response = await origFetch(...args);\n\n    response\n      .clone()\n      .blob()\n      .then(async (data) => {\n        const isInList = lemincaptchaListeningList.some(\n          (url) => _url.indexOf(url) !== -1\n        );\n        if (isInList) {\n          window.postMessage(\n            {\n              type: \"fetch\",\n              data: await data.text(),\n              url: _url,\n              captchaType: \"lemin\",\n            },\n            \"*\"\n          );\n        }\n      })\n      .catch((err) => {\n        console.log(err);\n      });\n\n    return response;\n  };\n})();\n","inject-turnstile.js":"(function () {\n  // console.log(\"inject-script of turnstile\");\n\n  window.addEventListener(\"message\", function (event) {\n    if (event.data?.type !== \"turnstileSolved\") return;\n\n\n    window?.turnstileCallback(event.data?.token);\n  });\n\n  if (window[\"turnstile\"]) {\n    window[\"turnstile\"] = new Proxy(window[\"turnstile\"], {\n      set: function (target, prop, value, receiver) {\n        return Reflect.set(target, prop, value, receiver);\n      },\n      get: function (target, prop) {\n        console.log(prop,\"from 1\")\n        if (prop === \"render\") {\n          return new Proxy(target[prop], {\n            apply: function (target, thisArg, argArray) {\n              console.log(\"calling form 1----\")\n              rewrite(argArray);\n              return null;\n            },\n          });\n        }\n\n        return target[prop];\n      },\n    });\n    return;\n  }\n\n  function rewrite([d, e]) {\n    console.log(e, \"e\");\n    const f = d[\"parentElement\"] || d;\n    if (!f[\"id\"]) {\n      f[\"id\"] = \"turnstile-input-\" + e[\"sitekey\"];\n    }\n    if (e[\"callback\"]) {\n      window[\"turnstileCallback\"] = e[\"callback\"];\n    }\n\n    window[\"registerTurnstileData\"] = {\n      sitekey: e[\"sitekey\"],\n    };\n\n    window.postMessage({\n      type: \"registerTurnstile\",\n      sitekey: e[\"sitekey\"],\n    });\n  }\n\n  window[\"turnstile\"] = new Proxy(\n    {\n      render: function () {},\n      reset: function () {},\n      ready: function () {},\n      remove: function () {},\n      execute: function () {},\n    },\n    {\n      set: function (target, prop, value, receiver) {\n        return Reflect.set(target, prop, value, receiver);\n      },\n      get: function (target, prop) {\n        console.log(prop,target, \"prop\");\n        if (prop === \"render\" || prop === \"catch\") {\n          return new Proxy(target[\"render\"], {\n            apply: function (target, thisArg, argArray) {\n              console.log(\"calling form 2\")\n             \n              rewrite(argArray);\n              return target.apply(thisArg, argArray);\n            },\n          });\n        }\n\n        return target[prop];\n      },\n    }\n  );\n})();\n","le.js":"const lemincaptchaListeningList = [\"/captcha/v1/cropped/pre-validate\"];\n\n(function (xhr) {\n  var XHR = XMLHttpRequest.prototype;\n\n  var open = XHR.open;\n  var send = XHR.send;\n\n  XHR.open = function (method, url) {\n    this._method = method;\n    this._url = url;\n    return open.apply(this, arguments);\n  };\n\n  XHR.send = function (postData) {\n    const _url = this._url;\n    this.addEventListener(\"load\", function () {\n      const isInList = lemincaptchaListeningList.some(\n        (url) => _url.indexOf(url) !== -1\n      );\n      if (isInList) {\n        window.postMessage(\n          { type: \"xhr\", data: this.response, url: _url, captchaType: \"lemin\" },\n          \"*\"\n        );\n      }\n    });\n\n    return send.apply(this, arguments);\n  };\n})(XMLHttpRequest);\n\n(function () {\n  let origFetch = window.fetch;\n  window.fetch = async function (...args) {\n    const _url = args[0];\n    const response = await origFetch(...args);\n\n    response\n      .clone()\n      .blob()\n      .then(async (data) => {\n        const isInList = lemincaptchaListeningList.some(\n          (url) => _url.indexOf(url) !== -1\n        );\n        if (isInList) {\n          window.postMessage(\n            {\n              type: \"fetch\",\n              data: await data.text(),\n              url: _url,\n              captchaType: \"lemin\",\n            },\n            \"*\"\n          );\n        }\n      })\n      .catch((err) => {\n        console.log(err);\n      });\n\n    return response;\n  };\n})();","mt.js":"// const mtcapNetworkUrls = [\n//   \"mtcv1/api/getchallenge.json\",\n//   \"mtcv1/api/getimage.json\",\n//   \"mtcv1/api/getaudio.json\",\n// ];\n\n// (function (xhr) {\n//   var XHR = XMLHttpRequest.prototype;\n\n//   var open = XHR.open;\n//   var send = XHR.send;\n\n//   XHR.open = function (method, url) {\n//     // console.log(url,\"url open\")\n//     this._method = method;\n//     this._url = url;\n//     return open.apply(this, arguments);\n//   };\n\n//   XHR.send = function (postData) {\n//     // console.log(JSON.parse(postData),\"post\")\n//     const _url = this._url;\n//     console.log(_url, this.response, \"url\");\n//     this.addEventListener(\"load\", function () {\n//       // console.log(JSON.parse(this.response),\"response\")\n//       const isInList = mtcapNetworkUrls.some((url) => _url.indexOf(url) !== -1);\n//       console.log(isInList,\"inlist\")\n//       if (isInList) {\n//         window.postMessage(\n//           { type: \"xhr\", data: this.response, url: _url, captchaType: \"mt\" },\n//           \"*\"\n//         );\n//       }\n//     });\n\n//     return send.apply(this, arguments);\n//   };\n// })(XMLHttpRequest);\n\n// (function () {\n//   let origFetch = window.fetch;\n//   window.fetch = async function (...args) {\n//     const _url = args[0];\n//     if (typeof _url !== \"string\") {\n//       return origFetch(...args);\n//     }\n//     const response = await origFetch(...args);\n\n//     response\n//       .clone()\n//       .blob()\n//       .then(async (data) => {\n//         const isInList = mtcapNetworkUrls.some(\n//           (url) => _url.indexOf(url) !== -1\n//         );\n//         if (isInList) {\n//           window.postMessage(\n//             {\n//               type: \"fetch\",\n//               data: await data.text(),\n//               url: _url,\n//               captchaType: \"mt\",\n//             },\n//             \"*\"\n//           );\n//         }\n//       })\n//       .catch((err) => {\n//         console.log(err);\n//       });\n\n//     return response;\n//   };\n// })();\nconst mtcapNetworkUrls = [\n  \"mtcv1/api/getchallenge.json\",\n  \"mtcv1/api/getimage.json\",\n  \"mtcv1/api/getaudio.json\",\n];\n\nfunction shouldInject(url) {\n  return mtcapNetworkUrls.some((endpoint) => url.includes(endpoint));\n}\n\n(function (xhr) {\n  const XHR = XMLHttpRequest.prototype;\n  const open = XHR.open;\n  const send = XHR.send;\n\n  XHR.open = function (method, url) {\n    this._method = method;\n    this._url = url;\n    return open.apply(this, arguments);\n  };\n\n  XHR.send = function (postData) {\n    if (!shouldInject(this._url)) return send.apply(this, arguments);\n\n    this.addEventListener(\"load\", function () {\n      if (shouldInject(this._url)) {\n        // console.log(\"Intercepted:\", this._url);\n        window.postMessage(\n          { type: \"xhr\", data: this.response, url: this._url, captchaType: \"mt\" },\n          \"*\"\n        );\n      }\n    });\n\n    return send.apply(this, arguments);\n  };\n})(XMLHttpRequest);\n\n(function () {\n  const origFetch = window.fetch;\n\n  window.fetch = async function (...args) {\n    let _url = args[0];\n\n    if (_url instanceof Request) {\n      _url = _url.url; // Extract URL from Request object\n    }\n\n    if (!shouldInject(_url)) return origFetch(...args);\n\n    const response = await origFetch(...args);\n\n    response.clone().text().then((data) => {\n      // console.log(\"Intercepted Fetch:\", _url);\n      window.postMessage(\n        { type: \"fetch\", data, url: _url, captchaType: \"mt\" },\n        \"*\"\n      );\n    });\n\n    return response;\n  };\n})();\n","proso.js":"window.alert = function (message) {\n    console.log(\"Blocked alert: \" + message);\n};\n\nwindow.addEventListener(\"message\", async (event) => {\n  if (event.data && event.data.type === \"CAPSONIC_CLICK_PROSOPO_TILES\") {\n    const answers = event.data.answers;\n    console.log(\"[Main World Proso] 🎯 Received tile click command with answers:\", answers);\n\n    const captchaElement = document.querySelector(\"prosopo-procaptcha, .prosopo-checkbox\");\n    const shadowRoot = captchaElement?.shadowRoot || \n                       captchaElement?.querySelector(\".prosopo-checkbox\")?.shadowRoot ||\n                       document.querySelector(\".prosopo-checkbox\")?.shadowRoot;\n\n    const modalOpen = document.querySelector(\".prosopo-modalOuter\") || \n                      (shadowRoot && shadowRoot.querySelector(\".prosopo-modalOuter\"));\n\n    const rawImages = [\n      ...(modalOpen ? Array.from(modalOpen.querySelectorAll(\"img\")) : []),\n      ...(shadowRoot ? Array.from(shadowRoot.querySelectorAll(\"img\")) : []),\n      ...Array.from(document.querySelectorAll(\".prosopo-modalOuter img, prosopo-procaptcha img, img\"))\n    ];\n\n    const gridImages = [];\n    const seen = new Set();\n    for (const img of rawImages) {\n      if (img && img.src && !seen.has(img.src)) {\n        seen.add(img.src);\n        gridImages.push(img);\n      }\n    }\n\n    console.log(`[Main World Proso] 🖼️ Discovered ${gridImages.length} grid images.`, gridImages);\n\n    for (let i = 0; i < gridImages.length && i < answers.length; i++) {\n      const img = gridImages[i];\n      const shouldClick = answers[i];\n\n      if (shouldClick) {\n        console.log(`[Main World Proso] 🟢 Clicking tile #${i + 1} (Answer: true)...`, img);\n\n        const tileContainer = img.closest(\"div[style*='cursor: pointer'], div[style*='cursor:pointer']\") || img.parentElement || img;\n\n        const rect = tileContainer.getBoundingClientRect();\n        const x = rect.left + rect.width / 2;\n        const y = rect.top + rect.height / 2;\n\n        const opts = { bubbles: true, cancelable: true, composed: true, view: window, clientX: x, clientY: y, button: 0, buttons: 1 };\n        const clickEvt = new MouseEvent(\"click\", { ...opts, buttons: 0 });\n\n        let curr = tileContainer;\n        let depth = 0;\n        while (curr && curr !== modalOpen && curr !== shadowRoot && curr !== document.body && depth < 6) {\n          const propsKey = Object.keys(curr).find(k => k.startsWith(\"__reactProps\") || k.startsWith(\"__reactEventHandlers\"));\n          if (propsKey && curr[propsKey]) {\n            const props = curr[propsKey];\n            const synth = { nativeEvent: clickEvt, target: img, currentTarget: curr, bubbles: true, cancelable: true, isTrusted: true, type: \"click\" };\n            if (typeof props.onClick === \"function\") try { props.onClick(synth); } catch (e) {}\n            if (typeof props.onPointerDown === \"function\") try { props.onPointerDown(synth); } catch (e) {}\n          }\n          curr = curr.parentElement;\n          depth++;\n        }\n\n        tileContainer.dispatchEvent(new PointerEvent(\"pointerdown\", opts));\n        tileContainer.dispatchEvent(new MouseEvent(\"mousedown\", opts));\n        tileContainer.dispatchEvent(new PointerEvent(\"pointerup\", { ...opts, buttons: 0 }));\n        tileContainer.dispatchEvent(new MouseEvent(\"mouseup\", { ...opts, buttons: 0 }));\n        tileContainer.dispatchEvent(clickEvt);\n        if (typeof tileContainer.click === \"function\") tileContainer.click();\n\n        await new Promise(r => setTimeout(r, 500));\n      }\n    }\n\n    console.log(\"[Main World Proso] ✅ Finished clicking tiles. Waiting for state update...\");\n    await new Promise(r => setTimeout(r, 600));\n\n    // Locate and click Next / Submit / Verify button in Main World\n    function findActionBtn() {\n      const searchScopes = [modalOpen, shadowRoot, document];\n      for (const scope of searchScopes) {\n        if (!scope) continue;\n        const btn = scope.querySelector(\"button[aria-label='Next'], button[aria-label='Submit'], button[aria-label='Verify']\") ||\n                    Array.from(scope.querySelectorAll(\"button\")).find(b => {\n                      const text = b.textContent?.trim().toLowerCase();\n                      return text === \"next\" || text === \"submit\" || text === \"verify\";\n                    });\n        if (btn) return btn;\n      }\n      return null;\n    }\n\n    const actionBtn = findActionBtn();\n    if (actionBtn) {\n      console.log(\"[Main World Proso] ➡️ Clicking Next/Submit button in Main World:\", actionBtn);\n\n      const opts = { bubbles: true, cancelable: true, composed: true, view: window };\n      const clickEvt = new MouseEvent(\"click\", { ...opts, buttons: 0 });\n\n      let curr = actionBtn;\n      let depth = 0;\n      while (curr && curr !== modalOpen && curr !== shadowRoot && curr !== document.body && depth < 4) {\n        const propsKey = Object.keys(curr).find(k => k.startsWith(\"__reactProps\") || k.startsWith(\"__reactEventHandlers\"));\n        if (propsKey && curr[propsKey]) {\n          const props = curr[propsKey];\n          const synth = { nativeEvent: clickEvt, target: actionBtn, currentTarget: curr, bubbles: true, cancelable: true, isTrusted: true, type: \"click\" };\n          if (typeof props.onClick === \"function\") try { props.onClick(synth); } catch (e) {}\n        }\n        curr = curr.parentElement;\n        depth++;\n      }\n\n      actionBtn.dispatchEvent(new PointerEvent(\"pointerdown\", opts));\n      actionBtn.dispatchEvent(new MouseEvent(\"mousedown\", opts));\n      actionBtn.dispatchEvent(new PointerEvent(\"pointerup\", { ...opts, buttons: 0 }));\n      actionBtn.dispatchEvent(new MouseEvent(\"mouseup\", { ...opts, buttons: 0 }));\n      actionBtn.dispatchEvent(clickEvt);\n      if (typeof actionBtn.click === \"function\") actionBtn.click();\n    } else {\n      console.warn(\"[Main World Proso] ⚠️ Next/Submit button not found in Main World.\");\n    }\n\n    window.postMessage({ type: \"CAPSONIC_PROSOPO_TILES_CLICKED\" }, \"*\");\n  }\n});","prosopo.js":"// const mtcapNetworkUrls = [\n//  \"https://pronode8.prosopo.io\"\n//   ];\n  \n//   function shouldInject(url) {\n//     return mtcapNetworkUrls.some((endpoint) => url.includes(endpoint));\n//   }\n\n//   (function () {\n//     const origFetch = window.fetch;\n  \n//     window.fetch = async function (...args) {\n//       let _url = args[0];\n  \n//       if (_url instanceof Request) {\n//         _url = _url.url; // Extract URL from Request object\n//       }\n  \n//       if (!shouldInject(_url)) return origFetch(...args);\n  \n//       const response = await origFetch(...args);\n  \n//       response.clone().text().then((data) => {\n//         // console.log(\"Intercepted Fetch:\", _url);\n//         window.postMessage(\n//           { type: \"fetch\", data, url: _url, captchaType: \"prosopo\" },\n//           \"*\"\n//         );\n//       });\n  \n//       return response;\n//     };\n//   })();\n\nconst targetUrls = [\"prosopo.io/v1/prosopo/provider/client/captcha/image\"];\n\nfunction shouldIntercept(url) {\n    return targetUrls.some((endpoint) => url.includes(endpoint));\n}\n\n(function () {\n    const originalFetch = window.fetch;\n\n    console.log(\"Injecting Prosopo script...\");\n\n    window.fetch = async function (...args) {\n        let requestUrl = args[0];\n        console.log(\"Intercepting Prosopo request:\", requestUrl);\n\n        if (requestUrl instanceof Request) {\n            requestUrl = requestUrl.url; // Extract URL from Request object\n        }\n\n        if (!shouldIntercept(requestUrl)) return originalFetch(...args);\n\n        const response = await originalFetch(...args);\n        const clonedResponse = response.clone();\n\n        clonedResponse.text().then((data) => {\n            console.log(\"Prosopo response:\", data);\n            window.postMessage(\n                { type: \"fetch_captcha\", url: requestUrl, data },\n                \"*\"\n            );\n        });\n\n        return response;\n    };\n})();\n","re.js":"const recaptchaListeningList = [\n  '/recaptcha/api2/reload',\n  '/recaptcha/api2/userverify',\n  '/recaptcha/enterprise/reload',\n  '/recaptcha/enterprise/userverify'\n];\n(function (xhr) {\n  \n  var XHR = XMLHttpRequest.prototype;\n\n  var open = XHR.open;\n  var send = XHR.send;\n\n  XHR.open = function (method, url) {\n    this._method = method;\n    this._url = url;\n    return open.apply(this, arguments);\n  };\n\n  XHR.send = function (postData) {\n    const _url = this._url;\n    this.addEventListener(\"load\", function () {\n      const isInList = recaptchaListeningList.some(\n        (url) => _url?.indexOf(url) !== -1\n      );\n      if (isInList) {\n        // console.log(this.response, \"this.response\");\n        window.postMessage(\n          { type: \"xhr\", data: this.response, url: _url, captchaType: \"recap\" },\n          \"*\"\n        );\n      }\n    });\n\n    return send.apply(this, arguments);\n  };\n})(XMLHttpRequest);\n\n(function () {\n  let origFetch = window.fetch;\n  window.fetch = async function (...args) {\n    const _url = args[0];\n    const response = await origFetch(...args);\n\n    response\n      .clone()\n      .blob()\n      .then(async (data) => {\n        const isInList = recaptchaListeningList.some(\n          (url) => _url?.indexOf(url) !== -1\n        );\n        if (isInList) {\n          window.postMessage(\n            {\n              type: \"fetch\",\n              data: await data.text(),\n              url: _url,\n              captchaType: \"recap\",\n            },\n            \"*\"\n          );\n        }\n      })\n      .catch((err) => {\n        console.log(err);\n      });\n\n    return response;\n  };\n})();\n"};

  const WASM_BASE64 = "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";

  const NOTIFY_CSS = "";

  const CONFIG = {

    API_BASE_URL: "https://api.captchasonic.com",

    FEEDBACK_BASE_URL: "https://feedback.captchasonic.com",

    ANALYTICS_BASE_URL: "https://access.captchasonic.com",

    UPDATE_URL: "https://captchasonic.com/update-required"

  };



  const ENDPOINTS = {

    createTask: CONFIG.API_BASE_URL + "/createTask",

    balance: (k) => CONFIG.API_BASE_URL + "/balance?apiKey=" + encodeURIComponent(k),

    ingest: CONFIG.API_BASE_URL + "/ingest",

    feedback: CONFIG.FEEDBACK_BASE_URL + "/extFeedback",

    reportAccuracy: CONFIG.FEEDBACK_BASE_URL + "/reportAccuracy",

    analytics: CONFIG.ANALYTICS_BASE_URL + "/api/track/"

  };



  // ==========================================

  // 2. SETTINGS STORAGE (GM_getValue / GM_setValue)

  // ==========================================

  function getStoredSettings() {

    try {

      const val = typeof GM_getValue !== "undefined" ? GM_getValue("settings", null) : null;

      if (val && typeof val === "object") {

        return Object.assign({}, DEFAULT_CONFIG, val);

      }

      if (typeof val === "string") {

        return Object.assign({}, DEFAULT_CONFIG, JSON.parse(val));

      }

    } catch (e) {

      console.warn("[CaptchaAI] Failed to parse settings:", e);

    }

    return Object.assign({}, DEFAULT_CONFIG);

  }



  function saveStoredSettings(newSettings) {

    try {

      if (typeof GM_setValue !== "undefined") {

        GM_setValue("settings", newSettings);

      }

      notifyStorageChanged({ settings: { newValue: newSettings } });

    } catch (e) {

      console.error("[CaptchaAI] Failed to save settings:", e);

    }

  }



  function getDeviceId() {

    let devId = typeof GM_getValue !== "undefined" ? GM_getValue("device_instance_id", null) : null;

    if (!devId) {

      devId = "tm_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString(36);

      if (typeof GM_setValue !== "undefined") GM_setValue("device_instance_id", devId);

    }

    return devId;

  }



  // ==========================================

  // 3. WASM SIGNER ENGINE

  // ==========================================

  const WasmSigner = {

    instance: null,

    memory: null,

    async init() {

      if (this.instance) return;

      try {

        const binStr = atob(WASM_BASE64);

        const len = binStr.length;

        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {

          bytes[i] = binStr.charCodeAt(i);

        }

        const wasmModule = await WebAssembly.instantiate(bytes, {

          env: {

            abort: (msg, file, line, col) => console.error("[CaptchaAI Wasm] Aborted!", msg, file, line, col)

          }

        });

        this.instance = wasmModule.instance;

        this.memory = this.instance.exports.memory;

      } catch (err) {

        console.error("[CaptchaAI] Failed to initialize Wasm Signer:", err);

      }

    },

    writeString(str) {

      if (!this.instance) return { ptr: 0, len: 0 };

      const encoder = new TextEncoder();

      const encoded = encoder.encode(str);

      const len = encoded.length;

      const ptr = this.instance.exports.alloc(len);

      new Uint8Array(this.memory.buffer).set(encoded, ptr);

      return { ptr, len };

    },

    readResult() {

      const ptr = this.instance.exports.getResultBufferPtr();

      const bytes = new Uint8Array(this.memory.buffer, ptr, 64);

      return String.fromCharCode(...bytes);

    },

    sign(deviceId, timestamp) {

      if (!this.instance) return null;

      try {

        const combined = deviceId + timestamp;

        const { ptr, len } = this.writeString(combined);

        this.instance.exports.signRequest(ptr, len);

        return this.readResult();

      } catch (e) {

        console.error("[CaptchaAI] Wasm signing error:", e);

        return null;

      }

    },

    getIntegrityHash() {

      if (!this.instance) return null;

      try {

        this.instance.exports.computeIntegrityHash();

        return this.readResult();

      } catch (e) {

        console.error("[CaptchaAI] Wasm integrity error:", e);

        return null;

      }

    }

  };



  // ==========================================

  // 4. CROSS-ORIGIN HTTP TRANSPORT

  // ==========================================

  function httpFetch(options) {

    return new Promise((resolve, reject) => {

      if (typeof GM_xmlhttpRequest !== "undefined") {

        GM_xmlhttpRequest({

          method: options.method || "GET",

          url: options.url,

          headers: options.headers || {},

          data: options.body,

          responseType: options.responseType || "text",

          timeout: options.timeout || 30000,

          onload: function (resp) {

            resolve({

              ok: resp.status >= 200 && resp.status < 300,

              status: resp.status,

              statusText: resp.statusText,

              responseText: resp.responseText,

              response: resp.response,

              json: async () => JSON.parse(resp.responseText)

            });

          },

          onerror: function (err) {

            reject(new Error(err.statusText || "Network request failed"));

          },

          ontimeout: function () {

            reject(new Error("Network request timed out"));

          }

        });

      } else {

        fetch(options.url, {

          method: options.method || "GET",

          headers: options.headers || {},

          body: options.body

        }).then(async res => {

          const text = await res.text();

          resolve({

            ok: res.ok,

            status: res.status,

            statusText: res.statusText,

            responseText: text,

            json: async () => JSON.parse(text)

          });

        }).catch(reject);

      }

    });

  }



  // ==========================================

  // 5. CAPTCHA SOLVER RPC LOGIC

  // ==========================================

  async function solveCaptchaTask(payload) {

    const settings = getStoredSettings();

    const apiKey = payload.apiKey || settings.APIKEY || "";

    if (!apiKey) {

      throw new Error("API_KEY_NOT_FOUND!");

    }



    await WasmSigner.init();

    const deviceId = getDeviceId();

    const timestamp = Date.now().toString();

    const signature = WasmSigner.sign(deviceId, timestamp);

    const integrityHash = WasmSigner.getIntegrityHash();



    const headers = {

      "Content-Type": "application/json",

      "X-Extension-Version": VERSION,

      "X-Device-Id": deviceId,

      "X-Request-Timestamp": timestamp

    };

    if (signature) headers["X-Request-Signature"] = signature;

    if (integrityHash) headers["X-Integrity-Hash"] = integrityHash;



    const reqBody = {

      apiKey: apiKey,

      task: payload.task || {}

    };



    console.log("[CaptchaAI] Sending createTask:", reqBody.task?.type, "on", window.location.hostname);

    const resp = await httpFetch({

      method: "POST",

      url: ENDPOINTS.createTask,

      headers: headers,

      body: JSON.stringify(reqBody)

    });



    if (!resp.ok) {

      throw new Error("HTTP error " + resp.status + ": " + resp.responseText);

    }



    const data = await resp.json();

    console.log("[CaptchaAI] createTask response:", data);



    if (data.solution && Object.keys(data.solution).length > 0) {

      const k = data.solution;

      if (k.answers) try { data.answers = JSON.parse(k.answers); } catch { data.answers = k.answers; }

      if (k.meta) try { data.meta = JSON.parse(k.meta); } catch { data.meta = k.meta; }

      if (k.size) try { data.size = JSON.parse(k.size); } catch { data.size = k.size; }

      if (k.sol) try { data.sol = JSON.parse(k.sol); } catch { data.sol = k.sol; }

      if (!k.answers && !k.meta) {

        const L = Object.keys(k).sort((a, b) => Number(a) - Number(b));

        data.answers = L.map(x => k[x]);

      }

    }



    return data;

  }



  async function solveTurnstileTask(payload) {

    const settings = getStoredSettings();

    const apiKey = payload.apiKey || settings.APIKEY || "";

    await WasmSigner.init();

    const deviceId = getDeviceId();

    const timestamp = Date.now().toString();

    const signature = WasmSigner.sign(deviceId, timestamp);

    const integrityHash = WasmSigner.getIntegrityHash();



    const headers = {

      "Content-Type": "application/json",

      "X-Extension-Version": VERSION,

      "X-Device-Id": deviceId,

      "X-Request-Timestamp": timestamp

    };

    if (signature) headers["X-Request-Signature"] = signature;

    if (integrityHash) headers["X-Integrity-Hash"] = integrityHash;



    const taskPayload = {

      apiKey: apiKey,

      task: {

        type: "AntiTurnstileTaskProxyLess",

        websiteURL: payload.websiteURL || window.location.href,

        websiteKey: payload.websiteKey,

        userAgent: navigator.userAgent

      }

    };



    const resp = await httpFetch({

      method: "POST",

      url: ENDPOINTS.createTask,

      headers: headers,

      body: JSON.stringify(taskPayload)

    });



    const res = await resp.json();

    if (!res.taskId) {

      throw new Error("Failed to create Turnstile task: " + JSON.stringify(res));

    }



    const taskId = res.taskId;

    const maxAttempts = 30;

    for (let i = 0; i < maxAttempts; i++) {

      await new Promise(r => setTimeout(r, 2500));

      const pollResp = await httpFetch({

        method: "POST",

        url: ENDPOINTS.createTask,

        headers: headers,

        body: JSON.stringify({ apiKey: apiKey, taskId: taskId })

      });

      const pollRes = await pollResp.json();

      if (pollRes.status === "ready") {

        return pollRes.solution;

      }

      if (pollRes.status === "failed") {

        throw new Error("Turnstile solving failed");

      }

    }

    throw new Error("Turnstile solving timed out");

  }



  async function checkBalance(apiKey) {

    const key = apiKey || getStoredSettings().APIKEY;

    if (!key) throw new Error("No API Key configured");

    const resp = await httpFetch({

      method: "GET",

      url: ENDPOINTS.balance(key),

      headers: { "Content-Type": "application/json", "APIKEY": key }

    });

    return await resp.json();

  }



  // ==========================================

  // 6. CHROME EXTENSION API EMULATION

  // ==========================================

  const messageListeners = new Set();

  const storageListeners = new Set();



  function notifyStorageChanged(changes) {

    for (const listener of storageListeners) {

      try {

        listener(changes, "local");

      } catch (e) {

        console.error("[CaptchaAI] Storage change listener error:", e);

      }

    }

  }



  async function handleRuntimeMessage(msg) {

    if (!msg) return null;



    if (msg.type === "GET_IMAGE_BASE64") {

      try {

        const url = msg.payload?.url;

        if (!url) throw new Error("No URL provided");

        return new Promise((resolve) => {

          if (typeof GM_xmlhttpRequest !== "undefined") {

            GM_xmlhttpRequest({

              method: "GET",

              url: url,

              responseType: "arraybuffer",

              headers: {

                "User-Agent": navigator.userAgent,

                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",

                ...(msg.payload?.headers || {})

              },

              onload: function (resp) {

                try {

                  const bytes = new Uint8Array(resp.response);

                  let binary = '';

                  for (let i = 0; i < bytes.byteLength; i++) {

                    binary += String.fromCharCode(bytes[i]);

                  }

                  const base64 = btoa(binary);

                  resolve({ success: true, data: base64 });

                } catch (e) {

                  resolve({ success: false, error: e.message });

                }

              },

              onerror: function (err) {

                resolve({ success: false, error: err.statusText || "Image fetch failed" });

              }

            });

          } else {

            fetch(url, { headers: msg.payload?.headers || {} })

              .then(res => res.arrayBuffer())

              .then(buf => {

                const bytes = new Uint8Array(buf);

                let binary = '';

                for (let i = 0; i < bytes.byteLength; i++) {

                  binary += String.fromCharCode(bytes[i]);

                }

                resolve({ success: true, data: btoa(binary) });

              })

              .catch(err => resolve({ success: false, error: err.message }));

          }

        });

      } catch (e) {

        return { success: false, error: e.message };

      }

    }



    if (msg.type === "rpc:createTask") {

      try {

        const data = await solveCaptchaTask(msg.payload);

        return { success: true, data: data };

      } catch (e) {

        return { success: false, error: e.message };

      }

    }



    if (msg.action === "solveTurnstile") {

      try {

        const data = await solveTurnstileTask(msg.payload);

        return { success: true, data: data };

      } catch (e) {

        return { success: false, error: e.message };

      }

    }



    if (msg.type === "rpc:getBalance") {

      try {

        const data = await checkBalance(msg.payload?.apiKey);

        return { success: true, data: { balance: data.balance, errorId: data.errorId, status: data.status } };

      } catch (e) {

        return { success: false, error: e.message };

      }

    }



    if (msg.action === "getActiveTabUrl") {

      return { url: window.location.href };

    }



    if (msg.action === "getTabId") {

      return { tabId: 1 };

    }



    if (msg.type === "solution_notification" || msg.type === "error_notification") {

      console.log("[CaptchaAI Notification]", msg.type, msg.action);

      showToastNotification(msg.action, msg.type === "solution_notification" ? "success" : "error");

      return { success: true };

    }



    if (msg.action === "CAPTCHA_DETECTED") {

      console.log("[CaptchaAI] Captcha detected:", msg.captchaType);

      showToastNotification("Captcha Detected: " + (msg.captchaType || "Unknown"), "info");

      return { success: true };

    }



    if (msg.type === "TRACK_EVENT") {

      return { success: true };

    }



    return { success: true };

  }



  function showToastNotification(text, type = "info") {

    const settings = getStoredSettings();

    if (settings.NOTIFICATION === false) return;



    let toastContainer = document.getElementById("captchasonic-toast-container");

    if (!toastContainer) {

      toastContainer = document.createElement("div");

      toastContainer.id = "captchasonic-toast-container";

      toastContainer.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;gap:8px;font-family:system-ui,-apple-system,sans-serif;pointer-events:none;";

      (document.body || document.documentElement).appendChild(toastContainer);

    }



    const toast = document.createElement("div");

    const bg = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";

    toast.style.cssText = "background:" + bg + ";color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;transition:all 0.3s ease;opacity:0;transform:translateY(10px);pointer-events:auto;";

    toast.innerHTML = '<span>⚡ CaptchaAI: ' + text + '</span>';

    toastContainer.appendChild(toast);



    setTimeout(() => {

      toast.style.opacity = "1";

      toast.style.transform = "translateY(0)";

    }, 10);



    setTimeout(() => {

      toast.style.opacity = "0";

      toast.style.transform = "translateY(10px)";

      setTimeout(() => toast.remove(), 300);

    }, 3500);

  }



  // Intercept fetch for internal extension resources

  const originalFetch = window.fetch;

  window.fetch = function (input, init) {

    const url = typeof input === "string" ? input : (input?.url || "");

    if (url.includes("/config/slideConfig.json") || url.endsWith("slideConfig.json")) {

      return Promise.resolve(new Response(JSON.stringify(SLIDE_CONFIG), {

        status: 200,

        headers: { "Content-Type": "application/json" }

      }));

    }

    if (url.includes("/config/defaultConfig.json") || url.endsWith("defaultConfig.json")) {

      return Promise.resolve(new Response(JSON.stringify(DEFAULT_CONFIG), {

        status: 200,

        headers: { "Content-Type": "application/json" }

      }));

    }

    if (url.includes("/messages.json") || url.includes("_locales/")) {

      return Promise.resolve(new Response(JSON.stringify(EN_MESSAGES), {

        status: 200,

        headers: { "Content-Type": "application/json" }

      }));

    }

    if (url.includes("notify.css")) {

      return Promise.resolve(new Response(NOTIFY_CSS, {

        status: 200,

        headers: { "Content-Type": "text/css" }

      }));

    }

    return originalFetch.apply(this, arguments);

  };



  const chromePolyfill = {

    runtime: {

      id: "captchasonic-tampermonkey-extension-id",

      lastError: null,

      getManifest: () => ({

        name: "Captcha Solver – CaptchaSonic",

        version: VERSION,

        manifest_version: 3,

        permissions: ["storage", "activeTab"]

      }),

      getURL: (filePath) => {

        if (!filePath) return "";

        if (filePath.includes("signer.wasm")) return "data:application/wasm;base64," + WASM_BASE64;

        if (filePath.includes("notify.css")) return "data:text/css;base64," + btoa(NOTIFY_CSS);

        if (filePath.includes("slideConfig.json")) return "data:application/json;base64," + btoa(JSON.stringify(SLIDE_CONFIG));

        if (filePath.includes("defaultConfig.json")) return "data:application/json;base64," + btoa(JSON.stringify(DEFAULT_CONFIG));

        if (filePath.includes("messages.json")) return "data:application/json;base64," + btoa(JSON.stringify(EN_MESSAGES));



        for (const [themeFile, themeCode] of Object.entries(THEMES)) {

          if (filePath.includes(themeFile)) {

            return "data:text/javascript;base64," + btoa(unescape(encodeURIComponent(themeCode)));

          }

        }

        return filePath;

      },

      sendMessage: function (msg, callback) {

        return new Promise((resolve) => {

          handleRuntimeMessage(msg).then((res) => {

            if (typeof callback === "function") callback(res);

            resolve(res);

          }).catch((err) => {

            const errRes = { success: false, error: err.message };

            if (typeof callback === "function") callback(errRes);

            resolve(errRes);

          });

        });

      },

      onMessage: {

        addListener: (fn) => messageListeners.add(fn),

        removeListener: (fn) => messageListeners.delete(fn),

        hasListener: (fn) => messageListeners.has(fn)

      }

    },

    storage: {

      local: {

        get: function (keys, callback) {

          return new Promise((resolve) => {

            const settings = getStoredSettings();

            let result = {};

            if (keys === null || keys === undefined) {

              result = { settings: settings, slideConfig: SLIDE_CONFIG, defaultConfig: DEFAULT_CONFIG };

            } else if (typeof keys === "string") {

              if (keys === "settings") result.settings = settings;

              else if (keys === "customEndpoint") result.customEndpoint = typeof GM_getValue !== "undefined" ? GM_getValue("customEndpoint", "") : "";

              else if (keys === "eventLog") result.eventLog = typeof GM_getValue !== "undefined" ? GM_getValue("eventLog", []) : [];

              else if (keys === "stats") result.stats = typeof GM_getValue !== "undefined" ? GM_getValue("stats", { totalSolves: 0, successCount: 0, totalTime: 0 }) : {};

              else result[keys] = typeof GM_getValue !== "undefined" ? GM_getValue(keys, undefined) : undefined;

            } else if (Array.isArray(keys)) {

              for (const k of keys) {

                if (k === "settings") result.settings = settings;

                else if (k === "metaid" || k === "device_instance_id") result[k] = getDeviceId();

                else result[k] = typeof GM_getValue !== "undefined" ? GM_getValue(k, undefined) : undefined;

              }

            } else if (typeof keys === "object") {

              for (const k in keys) {

                result[k] = typeof GM_getValue !== "undefined" ? GM_getValue(k, keys[k]) : keys[k];

              }

            }

            if (typeof callback === "function") callback(result);

            resolve(result);

          });

        },

        set: function (items, callback) {

          return new Promise((resolve) => {

            if (items && typeof items === "object") {

              for (const k in items) {

                if (k === "settings") {

                  saveStoredSettings(items[k]);

                } else if (typeof GM_setValue !== "undefined") {

                  GM_setValue(k, items[k]);

                }

              }

            }

            if (typeof callback === "function") callback();

            resolve();

          });

        },

        remove: function (keys, callback) {

          return new Promise((resolve) => {

            const list = Array.isArray(keys) ? keys : [keys];

            if (typeof GM_deleteValue !== "undefined") {

              for (const k of list) {

                GM_deleteValue(k);

              }

            }

            if (typeof callback === "function") callback();

            resolve();

          });

        },

        clear: function (callback) {

          return new Promise((resolve) => {

            if (typeof callback === "function") callback();

            resolve();

          });

        }

      },

      onChanged: {

        addListener: (fn) => storageListeners.add(fn),

        removeListener: (fn) => storageListeners.delete(fn)

      }

    },

    tabs: {

      query: (queryInfo, callback) => {

        const tabs = [{ id: 1, url: window.location.href, active: true }];

        if (typeof callback === "function") callback(tabs);

        return Promise.resolve(tabs);

      },

      sendMessage: (tabId, msg, callback) => {

        return handleRuntimeMessage(msg).then((res) => {

          if (typeof callback === "function") callback(res);

          return res;

        });

      }

    }

  };



  if (typeof globalThis.chrome === "undefined") {

    globalThis.chrome = chromePolyfill;

  } else {

    if (!globalThis.chrome.runtime) globalThis.chrome.runtime = chromePolyfill.runtime;

    else {

      globalThis.chrome.runtime.id = globalThis.chrome.runtime.id || chromePolyfill.runtime.id;

      globalThis.chrome.runtime.sendMessage = chromePolyfill.runtime.sendMessage;

      globalThis.chrome.runtime.getURL = chromePolyfill.runtime.getURL;

      globalThis.chrome.runtime.getManifest = chromePolyfill.runtime.getManifest;

    }

    if (!globalThis.chrome.storage) globalThis.chrome.storage = chromePolyfill.storage;

    if (!globalThis.chrome.tabs) globalThis.chrome.tabs = chromePolyfill.tabs;

  }

  if (typeof globalThis.browser === "undefined") {

    globalThis.browser = globalThis.chrome;

  }



  // Inject notify styling disabled to prevent corrupting host page layout / inputs
  // GM_addStyle(NOTIFY_CSS);



  // ==========================================

  // 7. TAMPERMONKEY UI & COMMANDS

  // ==========================================

  if (typeof GM_registerMenuCommand !== "undefined") {

    GM_registerMenuCommand("🔑 CaptchaAI: Set API Key", () => {

      const current = getStoredSettings().APIKEY || "";

      const key = prompt("Enter your CaptchaAI / CaptchaSonic API Key:", current);

      if (key !== null) {

        const s = getStoredSettings();

        s.APIKEY = key.trim();

        saveStoredSettings(s);

        alert("API Key saved successfully!");

      }

    });



    GM_registerMenuCommand("📊 CaptchaAI: Check Balance", async () => {

      const s = getStoredSettings();

      if (!s.APIKEY) {

        alert("Please set your API Key first!");

        return;

      }

      try {

        const res = await checkBalance(s.APIKEY);

        alert("CaptchaAI Account:\n\nBalance: " + (res.balance !== undefined ? res.balance : "N/A") + "\nUsername: " + (res.username || "N/A") + "\nStatus: " + (res.status || "OK"));

      } catch (err) {

        alert("Failed to fetch balance: " + err.message);

      }

    });



    GM_registerMenuCommand("⚡ CaptchaAI: Toggle Auto-Solve", () => {

      const s = getStoredSettings();

      s.ACTIVE = !s.ACTIVE;

      saveStoredSettings(s);

      alert("CaptchaAI Auto-Solve is now " + (s.ACTIVE ? "ENABLED ✅" : "DISABLED ❌"));

    });



    GM_registerMenuCommand("⚙️ CaptchaAI: Open Settings Panel", () => {

      openSettingsModal();

    });

  }



  function openSettingsModal() {

    let modal = document.getElementById("captchasonic-modal");

    if (modal) { modal.remove(); }



    const s = getStoredSettings();

    modal = document.createElement("div");

    modal.id = "captchasonic-modal";

    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;";



    const captchas = s.CAPTCHAS || DEFAULT_CONFIG.CAPTCHAS;

    const optionsHtml = captchas.map(c => {

      const enabled = s.OPTIONS?.[c]?.ENABLED !== false;

      const autoSolve = s.OPTIONS?.[c]?.AUTOSOLVE !== false;

      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #334155;">' +

        '<span style="font-size:13px;font-weight:500;color:#f1f5f9;">' + c + '</span>' +

        '<div style="display:flex;gap:12px;">' +

        '<label style="color:#94a3b8;font-size:12px;cursor:pointer;"><input type="checkbox" id="cs_enable_' + c + '" ' + (enabled ? 'checked' : '') + '> Enable</label>' +

        '<label style="color:#94a3b8;font-size:12px;cursor:pointer;"><input type="checkbox" id="cs_auto_' + c + '" ' + (autoSolve ? 'checked' : '') + '> Auto-solve</label>' +

        '</div></div>';

    }).join('');



    modal.innerHTML = `

      <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;width:440px;max-width:90vw;max-height:85vh;overflow-y:auto;padding:20px;color:#f8fafc;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">

          <h2 style="margin:0;font-size:18px;font-weight:700;color:#38bdf8;">⚡ CaptchaAI Settings</h2>

          <button id="cs_close_btn" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">&times;</button>

        </div>

        <div style="margin-bottom:14px;">

          <label style="display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:4px;">API KEY</label>

          <input type="text" id="cs_apikey_input" value="${s.APIKEY || ''}" placeholder="Enter CaptchaSonic / CaptchaAI API Key" style="width:100%;box-sizing:border-box;padding:8px 10px;background:#1e293b;border:1px solid #475569;border-radius:6px;color:#fff;font-size:13px;">

        </div>

        <div style="display:flex;gap:16px;margin-bottom:14px;">

          <label style="font-size:13px;color:#f1f5f9;cursor:pointer;"><input type="checkbox" id="cs_active_input" ${s.ACTIVE ? 'checked' : ''}> Master Active</label>

          <label style="font-size:13px;color:#f1f5f9;cursor:pointer;"><input type="checkbox" id="cs_notify_input" ${s.NOTIFICATION !== false ? 'checked' : ''}> Show Toasts</label>

        </div>

        <div style="margin-bottom:14px;">

          <label style="display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:8px;">CAPTCHA MODULES</label>

          <div style="max-height:220px;overflow-y:auto;padding-right:4px;">

            ${optionsHtml}

          </div>

        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">

          <button id="cs_cancel_btn" style="padding:8px 14px;background:#334155;border:none;border-radius:6px;color:#fff;font-size:13px;cursor:pointer;">Cancel</button>

          <button id="cs_save_btn" style="padding:8px 16px;background:#0284c7;border:none;border-radius:6px;color:#fff;font-weight:600;font-size:13px;cursor:pointer;">Save Changes</button>

        </div>

      </div>

    `;



    document.body.appendChild(modal);



    const closeModal = () => modal.remove();

    document.getElementById("cs_close_btn").onclick = closeModal;

    document.getElementById("cs_cancel_btn").onclick = closeModal;



    document.getElementById("cs_save_btn").onclick = () => {

      const curSettings = getStoredSettings();

      curSettings.APIKEY = document.getElementById("cs_apikey_input").value.trim();

      curSettings.ACTIVE = document.getElementById("cs_active_input").checked;

      curSettings.NOTIFICATION = document.getElementById("cs_notify_input").checked;



      if (!curSettings.OPTIONS) curSettings.OPTIONS = {};

      for (const c of captchas) {

        if (!curSettings.OPTIONS[c]) curSettings.OPTIONS[c] = {};

        const enEl = document.getElementById("cs_enable_" + c);

        const autoEl = document.getElementById("cs_auto_" + c);

        if (enEl) curSettings.OPTIONS[c].ENABLED = enEl.checked;

        if (autoEl) curSettings.OPTIONS[c].AUTOSOLVE = autoEl.checked;

      }



      saveStoredSettings(curSettings);

      alert("Settings saved!");

      closeModal();

    };

  }



  // ==========================================

  // 8. CONTENT SCRIPT RUNTIME

  // ==========================================

  const hostname = window.location.hostname;

  const isHcaptchaAsset = window.location.href.startsWith("https://newassets.hcaptcha.com/");



  console.log("[CaptchaAI Userscript] Active on", window.location.href);



  function runScript(name, scriptFn) {

    try {

      scriptFn();

    } catch (err) {

      console.error("[CaptchaAI] Error in " + name + ":", err);

    }

  }



  // 8.1 Universal

  runScript("universal", function() {

    var universal=(function(){"use strict";function re(i){return i}const O={matches:["<all_urls>"],run_at:"document_start",cssInjectionMode:"manual",main(){const e=(...t)=>!1,r=[{id:"hcaptcha",iframeSelector:"iframe[src*='newassets.hcaptcha.com'], iframe[src*='hcaptcha.com/captcha']",containerSelector:".h-captcha, [data-hcaptcha-widget-id]",readyPatterns:[],detected:!1,ready:!1},{id:"recaptcha",iframeSelector:"iframe[src*='recaptcha.net/recaptcha'], iframe[src*='google.com/recaptcha']",containerSelector:".g-recaptcha, [data-sitekey]",readyPatterns:[/recaptcha.*bframe/,/anchor\?/],detected:!1,ready:!1},{id:"geetest",iframeSelector:null,containerSelector:".geetest_radar_btn, .geetest_holder, .geetest_panel",readyPatterns:[],detected:!1,ready:!1},{id:"cloudflare",iframeSelector:"iframe[src*='challenges.cloudflare.com']",containerSelector:null,readyPatterns:[/turnstile/],detected:!1,ready:!1},{id:"mtcaptcha",iframeSelector:"iframe[src*='mtcaptcha.com']",containerSelector:".mtcaptcha",readyPatterns:[],detected:!1,ready:!1},{id:"tencent",iframeSelector:"iframe[src*='captcha.qq.com'], iframe[src*='t.captcha.qq.com'], iframe[src*='tencentcloudcs.com'], iframe[src*='cloudcachetci.com']",containerSelector:"#tcaptcha_transform_dy, #TencentCaptcha, .tencent-captcha-dy__click-type-wrap",readyPatterns:[],detected:!1,ready:!1}],n=t=>{if(!t)return!1;const o=window.getComputedStyle(t);if(o.display==="none"||o.visibility!=="visible"||parseFloat(o.opacity)<.1)return!1;const h=t.getBoundingClientRect();return!(h.width<10||h.height<10||!t.offsetParent&&o.position!=="fixed")},g=t=>{try{typeof chrome<"u"&&chrome?.runtime?.sendMessage&&chrome.runtime.sendMessage(t)}catch{}},d=()=>{for(const t of r){if(t.detected)continue;let o=null;t.iframeSelector&&(o=document.querySelector(t.iframeSelector),o&&!n(o)&&(o=null)),!o&&t.containerSelector&&(o=document.querySelector(t.containerSelector),o&&!n(o)&&(o=null),o&&e(`Found container for ${t.id}:`,o.className)),o&&(t.detected=!0,e(`✅ DETECTED: ${t.id}`),g({action:"CAPTCHA_DETECTED",captchaType:t.id,url:location.href}),S(t))}},S=t=>{if(!t.ready){if(e(`Checking ready for ${t.id}...`),t.iframeSelector&&t.readyPatterns.length>0){const o=document.querySelectorAll(t.iframeSelector);e(`  Found ${o.length} iframes`);for(const h of o){const x=h.src||"";e(`  Iframe src: ${x.substring(0,100)}`);for(const v of t.readyPatterns)if(v.test(x)){y(t);return}}}if(t.id==="hcaptcha"){const o=document.querySelectorAll("iframe[src*='hcaptcha.com']");if(e(`  hCaptcha iframes count: ${o.length}`),o.length>=2){y(t);return}for(const h of o){const x=h.getBoundingClientRect();if(e(`  Iframe size: ${x.width}x${x.height}`),x.height>200&&x.width>200){y(t);return}}}if(t.id==="recaptcha"&&document.querySelector("iframe[src*='bframe'], iframe[src*='api2/bframe']")){y(t);return}if(t.id==="geetest"){const o=document.querySelector(".geetest_panel_box, .geetest_window");if(o&&o.offsetHeight>100){y(t);return}}if(t.id==="mtcaptcha"){const o=document.querySelector("iframe[src*='mtcaptcha.com']");if(o&&n(o)){y(t);return}}if(t.id==="tencent"){const o=document.querySelector("#tcaptcha_transform_dy, .tencent-captcha-dy__click-type-wrap");if(o&&n(o)){y(t);return}const h=document.querySelector("iframe[src*='captcha.qq.com'], iframe[src*='tencentcloudcs.com'], iframe[src*='cloudcachetci.com']");if(h&&n(h)){y(t);return}}}},y=t=>{t.ready||(t.ready=!0,e(`🎉 READY: ${t.id}`),g({action:"CAPTCHA_READY",captchaType:t.id,url:location.href}))};d();let T=null;const C=new MutationObserver(()=>{T&&clearTimeout(T),T=setTimeout(()=>{d();for(const t of r)t.detected&&!t.ready&&S(t)},150)});C.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["src","style","class"]}),window.addEventListener("beforeunload",()=>{C.disconnect(),g({action:"CAPTCHA_UNLOAD",url:location.href})})}};function U(i){return i&&i.__esModule&&Object.prototype.hasOwnProperty.call(i,"default")?i.default:i}var _={exports:{}},j=_.exports,L;function W(){return L||(L=1,(function(i,e){(function(r,n){n(i)})(typeof globalThis<"u"?globalThis:typeof self<"u"?self:j,function(r){if(!(globalThis.chrome&&globalThis.chrome.runtime&&globalThis.chrome.runtime.id))throw new Error("This script should only be loaded in a browser extension.");if(globalThis.browser&&globalThis.browser.runtime&&globalThis.browser.runtime.id)r.exports=globalThis.browser;else{const n="The message port closed before a response was received.",g=d=>{const S={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2,singleCallbackArg:!1}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0},elements:{createSidebarPane:{minArgs:1,maxArgs:1}}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},goBack:{minArgs:0,maxArgs:1},goForward:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(Object.keys(S).length===0)throw new Error("api-metadata.json has not been included in browser-polyfill");class y extends WeakMap{constructor(a,l=void 0){super(l),this.createItem=a}get(a){return this.has(a)||this.set(a,this.createItem(a)),super.get(a)}}const T=s=>s&&typeof s=="object"&&typeof s.then=="function",C=(s,a)=>(...l)=>{d.runtime.lastError?s.reject(new Error(d.runtime.lastError.message)):a.singleCallbackArg||l.length<=1&&a.singleCallbackArg!==!1?s.resolve(l[0]):s.resolve(l)},t=s=>s==1?"argument":"arguments",o=(s,a)=>function(m,...u){if(u.length<a.minArgs)throw new Error(`Expected at least ${a.minArgs} ${t(a.minArgs)} for ${s}(), got ${u.length}`);if(u.length>a.maxArgs)throw new Error(`Expected at most ${a.maxArgs} ${t(a.maxArgs)} for ${s}(), got ${u.length}`);return new Promise((f,p)=>{if(a.fallbackToNoCallback)try{m[s](...u,C({resolve:f,reject:p},a))}catch(c){console.warn(`${s} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,c),m[s](...u),a.fallbackToNoCallback=!1,a.noCallback=!0,f()}else a.noCallback?(m[s](...u),f()):m[s](...u,C({resolve:f,reject:p},a))})},h=(s,a,l)=>new Proxy(a,{apply(m,u,f){return l.call(u,s,...f)}});let x=Function.call.bind(Object.prototype.hasOwnProperty);const v=(s,a={},l={})=>{let m=Object.create(null),u={has(p,c){return c in s||c in m},get(p,c,b){if(c in m)return m[c];if(!(c in s))return;let A=s[c];if(typeof A=="function")if(typeof a[c]=="function")A=h(s,s[c],a[c]);else if(x(l,c)){let E=o(c,l[c]);A=h(s,s[c],E)}else A=A.bind(s);else if(typeof A=="object"&&A!==null&&(x(a,c)||x(l,c)))A=v(A,a[c],l[c]);else if(x(l,"*"))A=v(A,a[c],l["*"]);else return Object.defineProperty(m,c,{configurable:!0,enumerable:!0,get(){return s[c]},set(E){s[c]=E}}),A;return m[c]=A,A},set(p,c,b,A){return c in m?m[c]=b:s[c]=b,!0},defineProperty(p,c,b){return Reflect.defineProperty(m,c,b)},deleteProperty(p,c){return Reflect.deleteProperty(m,c)}},f=Object.create(s);return new Proxy(f,u)},R=s=>({addListener(a,l,...m){a.addListener(s.get(l),...m)},hasListener(a,l){return a.hasListener(s.get(l))},removeListener(a,l){a.removeListener(s.get(l))}}),Q=new y(s=>typeof s!="function"?s:function(l){const m=v(l,{},{getContent:{minArgs:0,maxArgs:0}});s(m)}),B=new y(s=>typeof s!="function"?s:function(l,m,u){let f=!1,p,c=new Promise(k=>{p=function(w){f=!0,k(w)}}),b;try{b=s(l,m,p)}catch(k){b=Promise.reject(k)}const A=b!==!0&&T(b);if(b!==!0&&!A&&!f)return!1;const E=k=>{k.then(w=>{u(w)},w=>{let q;w&&(w instanceof Error||typeof w.message=="string")?q=w.message:q="An unexpected error occurred",u({__mozWebExtensionPolyfillReject__:!0,message:q})}).catch(w=>{console.error("Failed to send onMessage rejected reply",w)})};return E(A?b:c),!0}),X=({reject:s,resolve:a},l)=>{d.runtime.lastError?d.runtime.lastError.message===n?a():s(new Error(d.runtime.lastError.message)):l&&l.__mozWebExtensionPolyfillReject__?s(new Error(l.message)):a(l)},D=(s,a,l,...m)=>{if(m.length<a.minArgs)throw new Error(`Expected at least ${a.minArgs} ${t(a.minArgs)} for ${s}(), got ${m.length}`);if(m.length>a.maxArgs)throw new Error(`Expected at most ${a.maxArgs} ${t(a.maxArgs)} for ${s}(), got ${m.length}`);return new Promise((u,f)=>{const p=X.bind(null,{resolve:u,reject:f});m.push(p),l.sendMessage(...m)})},ee={devtools:{network:{onRequestFinished:R(Q)}},runtime:{onMessage:R(B),onMessageExternal:R(B),sendMessage:D.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:D.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},F={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return S.privacy={network:{"*":F},services:{"*":F},websites:{"*":F}},v(d,ee,S)};r.exports=g(chrome)}})})(_)),_.exports}var H=W();const K=U(H);function P(i,...e){}const V={debug:(...i)=>P(console.debug,...i),log:(...i)=>P(console.log,...i),warn:(...i)=>P(console.warn,...i),error:(...i)=>P(console.error,...i)};class N extends Event{constructor(e,r){super(N.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=r}static EVENT_NAME=$("wxt:locationchange")}function $(i){return`${K?.runtime?.id}:universal:${i}`}function G(i){let e,r;return{run(){e==null&&(r=new URL(location.href),e=i.setInterval(()=>{let n=new URL(location.href);n.href!==r.href&&(window.dispatchEvent(new N(n,r)),r=n)},1e3))}}}class M{constructor(e,r){this.contentScriptName=e,this.options=r,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}static SCRIPT_STARTED_MESSAGE_TYPE=$("wxt:content-script-started");isTopFrame=window.self===window.top;abortController;locationWatcher=G(this);receivedMessageIds=new Set;get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return K.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,r){const n=setInterval(()=>{this.isValid&&e()},r);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,r){const n=setTimeout(()=>{this.isValid&&e()},r);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){const r=requestAnimationFrame((...n)=>{this.isValid&&e(...n)});return this.onInvalidated(()=>cancelAnimationFrame(r)),r}requestIdleCallback(e,r){const n=requestIdleCallback((...g)=>{this.signal.aborted||e(...g)},r);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,r,n,g){r==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(r.startsWith("wxt:")?$(r):r,n,{...g,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),V.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:M.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){const r=e.data?.type===M.SCRIPT_STARTED_MESSAGE_TYPE,n=e.data?.contentScriptName===this.contentScriptName,g=!this.receivedMessageIds.has(e.data?.messageId);return r&&n&&g}listenForNewerScripts(e){let r=!0;const n=g=>{if(this.verifyScriptStartedEvent(g)){this.receivedMessageIds.add(g.data.messageId);const d=r;if(r=!1,d&&e?.ignoreFirstEvent)return;this.notifyInvalidated()}};addEventListener("message",n),this.onInvalidated(()=>removeEventListener("message",n))}}const z=Symbol("null");let Y=0;class Z extends Map{constructor(){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;const[e]=arguments;if(e!=null){if(typeof e[Symbol.iterator]!="function")throw new TypeError(typeof e+" is not iterable (cannot read property Symbol(Symbol.iterator))");for(const[r,n]of e)this.set(r,n)}}_getPublicKeys(e,r=!1){if(!Array.isArray(e))throw new TypeError("The keys parameter must be an array");const n=this._getPrivateKey(e,r);let g;return n&&this._publicKeys.has(n)?g=this._publicKeys.get(n):r&&(g=[...e],this._publicKeys.set(n,g)),{privateKey:n,publicKey:g}}_getPrivateKey(e,r=!1){const n=[];for(let g of e){g===null&&(g=z);const d=typeof g=="object"||typeof g=="function"?"_objectHashes":typeof g=="symbol"?"_symbolHashes":!1;if(!d)n.push(g);else if(this[d].has(g))n.push(this[d].get(g));else if(r){const S=`@@mkm-ref-${Y++}@@`;this[d].set(g,S),n.push(S)}else return!1}return JSON.stringify(n)}set(e,r){const{publicKey:n}=this._getPublicKeys(e,!0);return super.set(n,r)}get(e){const{publicKey:r}=this._getPublicKeys(e);return super.get(r)}has(e){const{publicKey:r}=this._getPublicKeys(e);return super.has(r)}delete(e){const{publicKey:r,privateKey:n}=this._getPublicKeys(e);return!!(r&&super.delete(r)&&this._publicKeys.delete(n))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return"ManyKeysMap"}get size(){return super.size}}new Z;function se(){}function I(i,...e){}const J={debug:(...i)=>I(console.debug,...i),log:(...i)=>I(console.log,...i),warn:(...i)=>I(console.warn,...i),error:(...i)=>I(console.error,...i)};return(async()=>{try{const{main:i,...e}=O,r=new M("universal",e);return await i(r)}catch(i){throw J.error('The content script "universal" crashed on startup!',i),i}})()})();

universal;



  });



  // 8.2 Global (hCaptcha assets)

  if (isHcaptchaAsset && true) {

    runScript("global", function() {

      var global=(function(){"use strict";function a(n){return n}const o={matches:["https://newassets.hcaptcha.com/*"],allFrames:!0,match_about_blank:!1,run_at:"document_start",world:"MAIN",async main(){const n=Image;Image=function(){const r=new n;return r.crossOrigin="anonymous",r}}};function s(){}function t(n,...r){}const e={debug:(...n)=>t(console.debug,...n),log:(...n)=>t(console.log,...n),warn:(...n)=>t(console.warn,...n),error:(...n)=>t(console.error,...n)};return(async()=>{try{return await o.main()}catch(n){throw e.error('The content script "global" crashed on startup!',n),n}})()})();

global;



    });

  }



  // 8.3 Core Solvers

  runScript("solveCallback", function() {

    var solvecallback=(function(){"use strict";function Pe(e){return e}const te=!1,D={equals:(e,s)=>e===s};let ne=G;const v=1,E=2;var k=null;let L=null,ie=null,u=null,f=null,w=null,T=0;function ae(e,s){s=s?Object.assign({},D,s):D;const r={value:e,observers:null,observerSlots:null,comparator:s.equals||void 0},t=a=>(typeof a=="function"&&(a=a(r.value)),W(r,a));return[le.bind(r),t]}function oe(e){if(u===null)return e();const s=u;u=null;try{return e()}finally{u=s}}function le(){if(this.sources&&this.state)if(this.state===v)V(this);else{const e=f;f=null,C(()=>P(this)),f=e}if(u){const e=this.observers?this.observers.length:0;u.sources?(u.sources.push(this),u.sourceSlots.push(e)):(u.sources=[this],u.sourceSlots=[e]),this.observers?(this.observers.push(u),this.observerSlots.push(u.sources.length-1)):(this.observers=[u],this.observerSlots=[u.sources.length-1])}return this.value}function W(e,s,r){let t=e.value;return(!e.comparator||!e.comparator(t,s))&&(e.value=s,e.observers&&e.observers.length&&C(()=>{for(let a=0;a<e.observers.length;a+=1){const g=e.observers[a],h=L&&L.running;h&&L.disposed.has(g),(h?!g.tState:!g.state)&&(g.pure?f.push(g):w.push(g),g.observers&&Y(g)),h||(g.state=v)}if(f.length>1e6)throw f=[],new Error})),s}function V(e){if(!e.fn)return;_(e);const s=T;ge(e,e.value,s)}function ge(e,s,r){let t;const a=k,g=u;u=k=e;try{t=e.fn(s)}catch(h){return e.pure&&(e.state=v,e.owned&&e.owned.forEach(_),e.owned=null),e.updatedAt=r+1,z(h)}finally{u=g,k=a}(!e.updatedAt||e.updatedAt<=r)&&(e.updatedAt!=null&&"observers"in e?W(e,t):e.value=t,e.updatedAt=r)}function H(e){if(e.state===0)return;if(e.state===E)return P(e);if(e.suspense&&oe(e.suspense.inFallback))return e.suspense.effects.push(e);const s=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<T);)e.state&&s.push(e);for(let r=s.length-1;r>=0;r--)if(e=s[r],e.state===v)V(e);else if(e.state===E){const t=f;f=null,C(()=>P(e,s[0])),f=t}}function C(e,s){if(f)return e();let r=!1;f=[],w?r=!0:w=[],T++;try{const t=e();return ce(r),t}catch(t){r||(w=null),f=null,z(t)}}function ce(e){if(f&&(G(f),f=null),e)return;const s=w;w=null,s.length&&C(()=>ne(s))}function G(e){for(let s=0;s<e.length;s++)H(e[s])}function P(e,s){e.state=0;for(let r=0;r<e.sources.length;r+=1){const t=e.sources[r];if(t.sources){const a=t.state;a===v?t!==s&&(!t.updatedAt||t.updatedAt<T)&&H(t):a===E&&P(t,s)}}}function Y(e){for(let s=0;s<e.observers.length;s+=1){const r=e.observers[s];r.state||(r.state=E,r.pure?f.push(r):w.push(r),r.observers&&Y(r))}}function _(e){let s;if(e.sources)for(;e.sources.length;){const r=e.sources.pop(),t=e.sourceSlots.pop(),a=r.observers;if(a&&a.length){const g=a.pop(),h=r.observerSlots.pop();t<a.length&&(g.sourceSlots[h]=t,a[t]=g,r.observerSlots[t]=h)}}if(e.tOwned){for(s=e.tOwned.length-1;s>=0;s--)_(e.tOwned[s]);delete e.tOwned}if(e.owned){for(s=e.owned.length-1;s>=0;s--)_(e.owned[s]);e.owned=null}if(e.cleanups){for(s=e.cleanups.length-1;s>=0;s--)e.cleanups[s]();e.cleanups=null}e.state=0}function me(e){return e instanceof Error?e:new Error(typeof e=="string"?e:"Unknown error",{cause:e})}function z(e,s=k){throw me(e)}const ue={matches:["<all_urls>"],allFrames:!0,async main(){const[e,s]=ae(await chrome.storage.local.get("settings"));s(e().settings),e().APIKEY===""&&chrome.runtime.sendMessage({action:"API_KEY_NOT_FOUND!",type:"error_notification"}),typeof window[e().SolutionCallback]!="function"&&(window[e().SolutionCallback]=()=>{}),window.addEventListener("message",function(r){r.data.type==="capsoniCallback"&&(typeof window[r.data.callback]=="function"?(window.captchaSolved===!0&&(window[e().SolutionCallback]=()=>{console.log("🎉 You're human! Captcha cleared.")}),window[r.data.callback]&&window[r.data.callback]()):console.error(`⚠️ Callback function "${r.data.callback}" not found on window.`))})}};function Ae(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var M={exports:{}},fe=M.exports,Z;function he(){return Z||(Z=1,(function(e,s){(function(r,t){t(e)})(typeof globalThis<"u"?globalThis:typeof self<"u"?self:fe,function(r){if(!(globalThis.chrome&&globalThis.chrome.runtime&&globalThis.chrome.runtime.id))throw new Error("This script should only be loaded in a browser extension.");if(globalThis.browser&&globalThis.browser.runtime&&globalThis.browser.runtime.id)r.exports=globalThis.browser;else{const t="The message port closed before a response was received.",a=g=>{const h={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2,singleCallbackArg:!1}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0},elements:{createSidebarPane:{minArgs:1,maxArgs:1}}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},goBack:{minArgs:0,maxArgs:1},goForward:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(Object.keys(h).length===0)throw new Error("api-metadata.json has not been included in browser-polyfill");class Q extends WeakMap{constructor(i,l=void 0){super(l),this.createItem=i}get(i){return this.has(i)||this.set(i,this.createItem(i)),super.get(i)}}const Se=n=>n&&typeof n=="object"&&typeof n.then=="function",X=(n,i)=>(...l)=>{g.runtime.lastError?n.reject(new Error(g.runtime.lastError.message)):i.singleCallbackArg||l.length<=1&&i.singleCallbackArg!==!1?n.resolve(l[0]):n.resolve(l)},R=n=>n==1?"argument":"arguments",Ee=(n,i)=>function(c,...A){if(A.length<i.minArgs)throw new Error(`Expected at least ${i.minArgs} ${R(i.minArgs)} for ${n}(), got ${A.length}`);if(A.length>i.maxArgs)throw new Error(`Expected at most ${i.maxArgs} ${R(i.maxArgs)} for ${n}(), got ${A.length}`);return new Promise((d,x)=>{if(i.fallbackToNoCallback)try{c[n](...A,X({resolve:d,reject:x},i))}catch(o){console.warn(`${n} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,o),c[n](...A),i.fallbackToNoCallback=!1,i.noCallback=!0,d()}else i.noCallback?(c[n](...A),d()):c[n](...A,X({resolve:d,reject:x},i))})},ee=(n,i,l)=>new Proxy(i,{apply(c,A,d){return l.call(A,n,...d)}});let K=Function.call.bind(Object.prototype.hasOwnProperty);const $=(n,i={},l={})=>{let c=Object.create(null),A={has(x,o){return o in n||o in c},get(x,o,p){if(o in c)return c[o];if(!(o in n))return;let m=n[o];if(typeof m=="function")if(typeof i[o]=="function")m=ee(n,n[o],i[o]);else if(K(l,o)){let y=Ee(o,l[o]);m=ee(n,n[o],y)}else m=m.bind(n);else if(typeof m=="object"&&m!==null&&(K(i,o)||K(l,o)))m=$(m,i[o],l[o]);else if(K(l,"*"))m=$(m,i[o],l["*"]);else return Object.defineProperty(c,o,{configurable:!0,enumerable:!0,get(){return n[o]},set(y){n[o]=y}}),m;return c[o]=m,m},set(x,o,p,m){return o in c?c[o]=p:n[o]=p,!0},defineProperty(x,o,p){return Reflect.defineProperty(c,o,p)},deleteProperty(x,o){return Reflect.deleteProperty(c,o)}},d=Object.create(n);return new Proxy(d,A)},q=n=>({addListener(i,l,...c){i.addListener(n.get(l),...c)},hasListener(i,l){return i.hasListener(n.get(l))},removeListener(i,l){i.removeListener(n.get(l))}}),ke=new Q(n=>typeof n!="function"?n:function(l){const c=$(l,{},{getContent:{minArgs:0,maxArgs:0}});n(c)}),se=new Q(n=>typeof n!="function"?n:function(l,c,A){let d=!1,x,o=new Promise(S=>{x=function(b){d=!0,S(b)}}),p;try{p=n(l,c,x)}catch(S){p=Promise.reject(S)}const m=p!==!0&&Se(p);if(p!==!0&&!m&&!d)return!1;const y=S=>{S.then(b=>{A(b)},b=>{let B;b&&(b instanceof Error||typeof b.message=="string")?B=b.message:B="An unexpected error occurred",A({__mozWebExtensionPolyfillReject__:!0,message:B})}).catch(b=>{console.error("Failed to send onMessage rejected reply",b)})};return y(m?p:o),!0}),Te=({reject:n,resolve:i},l)=>{g.runtime.lastError?g.runtime.lastError.message===t?i():n(new Error(g.runtime.lastError.message)):l&&l.__mozWebExtensionPolyfillReject__?n(new Error(l.message)):i(l)},re=(n,i,l,...c)=>{if(c.length<i.minArgs)throw new Error(`Expected at least ${i.minArgs} ${R(i.minArgs)} for ${n}(), got ${c.length}`);if(c.length>i.maxArgs)throw new Error(`Expected at most ${i.maxArgs} ${R(i.maxArgs)} for ${n}(), got ${c.length}`);return new Promise((A,d)=>{const x=Te.bind(null,{resolve:A,reject:d});c.push(x),l.sendMessage(...c)})},Ce={devtools:{network:{onRequestFinished:q(ke)}},runtime:{onMessage:q(se),onMessageExternal:q(se),sendMessage:re.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:re.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},j={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return h.privacy={network:{"*":j},services:{"*":j},websites:{"*":j}},$(g,Ce,h)};r.exports=a(chrome)}})})(M)),M.exports}var de=he();const J=Ae(de);function N(e,...s){}const xe={debug:(...e)=>N(console.debug,...e),log:(...e)=>N(console.log,...e),warn:(...e)=>N(console.warn,...e),error:(...e)=>N(console.error,...e)};class O extends Event{constructor(s,r){super(O.EVENT_NAME,{}),this.newUrl=s,this.oldUrl=r}static EVENT_NAME=U("wxt:locationchange")}function U(e){return`${J?.runtime?.id}:solveCallback:${e}`}function pe(e){let s,r;return{run(){s==null&&(r=new URL(location.href),s=e.setInterval(()=>{let t=new URL(location.href);t.href!==r.href&&(window.dispatchEvent(new O(t,r)),r=t)},1e3))}}}class I{constructor(s,r){this.contentScriptName=s,this.options=r,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}static SCRIPT_STARTED_MESSAGE_TYPE=U("wxt:content-script-started");isTopFrame=window.self===window.top;abortController;locationWatcher=pe(this);receivedMessageIds=new Set;get signal(){return this.abortController.signal}abort(s){return this.abortController.abort(s)}get isInvalid(){return J.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(s){return this.signal.addEventListener("abort",s),()=>this.signal.removeEventListener("abort",s)}block(){return new Promise(()=>{})}setInterval(s,r){const t=setInterval(()=>{this.isValid&&s()},r);return this.onInvalidated(()=>clearInterval(t)),t}setTimeout(s,r){const t=setTimeout(()=>{this.isValid&&s()},r);return this.onInvalidated(()=>clearTimeout(t)),t}requestAnimationFrame(s){const r=requestAnimationFrame((...t)=>{this.isValid&&s(...t)});return this.onInvalidated(()=>cancelAnimationFrame(r)),r}requestIdleCallback(s,r){const t=requestIdleCallback((...a)=>{this.signal.aborted||s(...a)},r);return this.onInvalidated(()=>cancelIdleCallback(t)),t}addEventListener(s,r,t,a){r==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),s.addEventListener?.(r.startsWith("wxt:")?U(r):r,t,{...a,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),xe.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:I.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(s){const r=s.data?.type===I.SCRIPT_STARTED_MESSAGE_TYPE,t=s.data?.contentScriptName===this.contentScriptName,a=!this.receivedMessageIds.has(s.data?.messageId);return r&&t&&a}listenForNewerScripts(s){let r=!0;const t=a=>{if(this.verifyScriptStartedEvent(a)){this.receivedMessageIds.add(a.data.messageId);const g=r;if(r=!1,g&&s?.ignoreFirstEvent)return;this.notifyInvalidated()}};addEventListener("message",t),this.onInvalidated(()=>removeEventListener("message",t))}}const be=Symbol("null");let we=0;class ye extends Map{constructor(){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;const[s]=arguments;if(s!=null){if(typeof s[Symbol.iterator]!="function")throw new TypeError(typeof s+" is not iterable (cannot read property Symbol(Symbol.iterator))");for(const[r,t]of s)this.set(r,t)}}_getPublicKeys(s,r=!1){if(!Array.isArray(s))throw new TypeError("The keys parameter must be an array");const t=this._getPrivateKey(s,r);let a;return t&&this._publicKeys.has(t)?a=this._publicKeys.get(t):r&&(a=[...s],this._publicKeys.set(t,a)),{privateKey:t,publicKey:a}}_getPrivateKey(s,r=!1){const t=[];for(let a of s){a===null&&(a=be);const g=typeof a=="object"||typeof a=="function"?"_objectHashes":typeof a=="symbol"?"_symbolHashes":!1;if(!g)t.push(a);else if(this[g].has(a))t.push(this[g].get(a));else if(r){const h=`@@mkm-ref-${we++}@@`;this[g].set(a,h),t.push(h)}else return!1}return JSON.stringify(t)}set(s,r){const{publicKey:t}=this._getPublicKeys(s,!0);return super.set(t,r)}get(s){const{publicKey:r}=this._getPublicKeys(s);return super.get(r)}has(s){const{publicKey:r}=this._getPublicKeys(s);return super.has(r)}delete(s){const{publicKey:r,privateKey:t}=this._getPublicKeys(s);return!!(r&&super.delete(r)&&this._publicKeys.delete(t))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return"ManyKeysMap"}get size(){return super.size}}new ye;function Ne(){}function F(e,...s){}const ve={debug:(...e)=>F(console.debug,...e),log:(...e)=>F(console.log,...e),warn:(...e)=>F(console.warn,...e),error:(...e)=>F(console.error,...e)};return(async()=>{try{const{main:e,...s}=ue,r=new I("solveCallback",s);return await e(r)}catch(e){throw ve.error('The content script "solveCallback" crashed on startup!',e),e}})()})();

solvecallback;



  });



  runScript("trunstile", function() {

    var trunstile=(function(){"use strict";function Pe(e){return e}const ne=!1,D={equals:(e,s)=>e===s};let ie=z;const v=1,E=2;var T=null;let K=null,ae=null,u=null,f=null,w=null,k=0;function W(e,s){s=s?Object.assign({},D,s):D;const r={value:e,observers:null,observerSlots:null,comparator:s.equals||void 0},t=a=>(typeof a=="function"&&(a=a(r.value)),V(r,a));return[le.bind(r),t]}function oe(e){if(u===null)return e();const s=u;u=null;try{return e()}finally{u=s}}function le(){if(this.sources&&this.state)if(this.state===v)H(this);else{const e=f;f=null,C(()=>P(this)),f=e}if(u){const e=this.observers?this.observers.length:0;u.sources?(u.sources.push(this),u.sourceSlots.push(e)):(u.sources=[this],u.sourceSlots=[e]),this.observers?(this.observers.push(u),this.observerSlots.push(u.sources.length-1)):(this.observers=[u],this.observerSlots=[u.sources.length-1])}return this.value}function V(e,s,r){let t=e.value;return(!e.comparator||!e.comparator(t,s))&&(e.value=s,e.observers&&e.observers.length&&C(()=>{for(let a=0;a<e.observers.length;a+=1){const g=e.observers[a],h=K&&K.running;h&&K.disposed.has(g),(h?!g.tState:!g.state)&&(g.pure?f.push(g):w.push(g),g.observers&&Z(g)),h||(g.state=v)}if(f.length>1e6)throw f=[],new Error})),s}function H(e){if(!e.fn)return;_(e);const s=k;ge(e,e.value,s)}function ge(e,s,r){let t;const a=T,g=u;u=T=e;try{t=e.fn(s)}catch(h){return e.pure&&(e.state=v,e.owned&&e.owned.forEach(_),e.owned=null),e.updatedAt=r+1,Y(h)}finally{u=g,T=a}(!e.updatedAt||e.updatedAt<=r)&&(e.updatedAt!=null&&"observers"in e?V(e,t):e.value=t,e.updatedAt=r)}function G(e){if(e.state===0)return;if(e.state===E)return P(e);if(e.suspense&&oe(e.suspense.inFallback))return e.suspense.effects.push(e);const s=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<k);)e.state&&s.push(e);for(let r=s.length-1;r>=0;r--)if(e=s[r],e.state===v)H(e);else if(e.state===E){const t=f;f=null,C(()=>P(e,s[0])),f=t}}function C(e,s){if(f)return e();le
<truncated 634528 bytes>

NOTE: The output was truncated because it was too long. Use a more targeted query or a smaller range to get the information you need.