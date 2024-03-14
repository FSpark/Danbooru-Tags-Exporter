// ==UserScript==
// @name         Danbooru Tags Select to Export
// @name:zh-TW   Danbooru 標籤導出器
// @name:zh-HK   Danbooru 標籤導出器
// @name:zh-CN   Danbooru 标签导出器
// @name:ja      Danbooru Tags Select to Export
// @namespace    https://github.com/FSpark/Danbooru-Tags-Exporter
// @supportURL   https://github.com/FSpark/Danbooru-Tags-Exporter/issues
// @homepageURL  https://github.com/FSpark/Danbooru-Tags-Exporter
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @version      0.3.4
// @description  Select specified tags and copy to clipboard, for Stable Diffusion WebUI or NovelAI to use.
// @description:zh-TW  選擇指定標籤並複製到剪貼板，供Stable Diffusion WebUI或NovelAI等使用
// @description:zh-HK  選擇指定標籤並複製到剪貼板，供Stable Diffusion WebUI或NovelAI等使用
// @description:zh-CN  选择指定标签并复制到剪贴板，供Stable Diffusion WebUI或NovelAI等使用
// @description:ja  指定したタグを選択し、クリップボードにコピーして、Stable Diffusion WebUIやNovelAIなどで使用することができます。
// @author       FSpark
// @match        https://danbooru.donmai.us/posts/*
// @match        https://safebooru.donmai.us/posts/*
// @match        https://aibooru.online/posts/*
// @match        https://betabooru.donmai.us/posts/*
// @match        https://gelbooru.com/index.php?page=post&s=view&id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=donmai.us
// @grant        GM.setClipboard
// @grant        GM.notification
// @grant        GM.addStyle
// @license      AGPL-3.0
// ==/UserScript==

(function () {
    'use strict';
    if(location.host == "gelbooru.com"){
        GM_addStyle(`#tags-exporter-setting h2{ font-size:1.2em}
    #tags-exporter-setting { margin: 0px 10px 0px 10px; }
    #tags-exporter-container button, #tag-list button {padding: 0.1em 0.3em; margin-bottom:0.1em}
    #tags-exporter-container { margin: 0px 10px 0px 10px; }
    ul.tag-list li{margin: 2px 0 }
                #tags-exporter-setting label{margin: .25em; line-height: 1.5em;}
               .tag-weight {width: 3em; margin-left: .25em}`);
    }else{
    GM_addStyle(`#tags-exporter-setting button, #tag-list button {padding: 0.25em 0.75em;}
                #tags-exporter-setting label{margin: .25em; line-height: 1.5em;}
               .tag-weight {width: 3em; margin-left: .25em}`);
    }

    let SettingPanel = document.createElement('section');
    SettingPanel.id = "tags-exporter-setting";
    SettingPanel.innerHTML = `
      <h2>Tags Export Settings</h2>
<input type="checkbox" id="bracket-escape" checked/><label for="bracket-escape"><code>(</code> <code>)</code> -> <code>\\(</code> <code>\\)</code></label><br>
<input type="checkbox" id="set-weight" /><label for="set-weight">Setting weights</label><br>
<div>
 <input type="radio" name="use-bracket" id="round-brackets" value="0" checked/><label for="round-brackets">Using ( )</label>
<input type="radio" name="use-bracket" id="curly-brackets" value="-1"/><label for="curly-brackets">Using { }</label></div>
    `
	let Container = document.createElement('div');
    Container.id = "tags-exporter-container";
    Container.innerHTML = `<button name="select_all">All</button>
<button  name="select_none">None</button>
<button  name="invert_select">Invert</button>
<button  name="export">Export</button>
`

	function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    function insertBefore(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }

    if(location.host == "gelbooru.com"){
        insertBefore(SettingPanel, document.querySelector(".aside>.tag-list"))
        insertBefore(Container, document.querySelector(".aside>.tag-list"))
    }else{
        insertAfter(SettingPanel, document.querySelector("#search-box"))
        insertAfter(Container, document.querySelector("#tags-exporter-setting > h2"))
    }

    function addBrackets(prompts,isRound,n){
        let l,r;
        if(n==0)
            return prompts
        else if(n>0){
            if(isRound){
                l='('
                r=')'}
            else{
                l='{'
                r='}'
            }
        }else{
            l='['
            r=']'
        }
        n=Math.abs(n)
        return l.repeat(n).concat(prompts,r.repeat(n))
    }
    function exportTags(target){
        let tags = []
        let bracket_escape = document.getElementById("bracket-escape").checked
        let set_weight = document.getElementById("set-weight").checked
        let round_brackets = document.getElementById("round-brackets").checked
        document.querySelectorAll(target).forEach((e) => {
            let prompts = e.value
            if(bracket_escape)
                prompts = prompts.replaceAll(`(`,`\\(`).replaceAll(`)`,`\\)`)
            if(set_weight){
                prompts = addBrackets(prompts,round_brackets,e.nextSibling.value)
            }
            tags.push(prompts)
        })
        let res = tags.join(", ")
        GM.setClipboard(res)
        GM.notification(`${tags.length} tag(s) were copied.`, "Danbooru Tags Exporter")
    }

    function insertButtons(target){
        let head = document.querySelector(`h3.${target}-list`)
        if(!head) return;
        let buttonContainer = Container.cloneNode(true)
        buttonContainer.id = `${target}-buttons`
		insertAfter(buttonContainer, head)
        document.querySelectorAll(`.${target}-list>li`).forEach((e) => {
            let chk = document.createElement('input');
            chk.type = "checkbox"
            chk.name = `${target}s`
			chk.value = e.dataset.tagName.replaceAll("_", " ")
            e.insertBefore(chk, e.firstChild)

            let nbr = document.createElement('input');
            nbr.type = "number"
            nbr.name = `${target}s-weight`
            nbr.className = "tag-weight"
            nbr.value = 0
            nbr.hidden = true
            insertAfter(nbr,chk)
        })

        buttonContainer.querySelector("[name='select_all']").onclick = function () {
            var items = document.getElementsByName(`${target}s`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked = true;

            }
        };
        buttonContainer.querySelector("[name='select_none']").onclick = function () {
            var items = document.getElementsByName(`${target}s`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked = false;

            }
        };
        buttonContainer.querySelector("[name='invert_select']").onclick = function () {
            var items = document.getElementsByName(`${target}s`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked == true ? items[i].checked = false : items[i].checked = true;

            }
        };
        buttonContainer.querySelector("[name='export']").onclick = function () {
            exportTags(`[name=${target}s]:checked`)
        };
    }
    function insertButtonsGelbooru(target){
        let head = document.querySelector(`.${target}`)
        if(!head) return;
        head = head.previousSibling;
        let buttonContainer = Container.cloneNode(true)
        buttonContainer.id = `${target}-buttons`
		insertAfter(buttonContainer, head)
        document.querySelectorAll(`.${target}`).forEach((e) => {
            let chk = document.createElement('input');
            chk.type = "checkbox"
            chk.name = `${target}s`
			chk.value = e.querySelector(':scope>a').innerText;
            e.insertBefore(chk, e.firstChild)

            let nbr = document.createElement('input');
            nbr.type = "number"
            nbr.name = `${target}s-weight`
            nbr.className = "tag-weight"
            nbr.value = 0
            nbr.hidden = true
            insertAfter(nbr,chk)
        })

        buttonContainer.querySelector("[name='select_all']").onclick = function () {
            var items = document.getElementsByName(`${target}s`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked = true;

            }
        };
        buttonContainer.querySelector("[name='select_none']").onclick = function () {
            var items = document.getElementsByName(`${target}s`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked = false;

            }
        };
        buttonContainer.querySelector("[name='invert_select']").onclick = function () {
            var items = document.getElementsByName(`${target}s`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked == true ? items[i].checked = false : items[i].checked = true;

            }
        };
        buttonContainer.querySelector("[name='export']").onclick = function () {
            exportTags(`[name=${target}s]:checked`)
        };
    }

    ["artist-tag","character-tag","copyright-tag","general-tag"].forEach((t)=>insertButtons(t));
    ["tag-type-artist","tag-type-character","tag-type-copyright","tag-type-metadata","tag-type-general"].forEach((t)=>insertButtonsGelbooru(t));


    Container.querySelector("[name='select_all']").onclick = function () {
        var items = document.querySelectorAll("#tag-list input[type='checkbox']")
        for (var i = 0; i < items.length; i++) {
            items[i].checked = true;
        }
    };
    Container.querySelector("[name='select_none']").onclick = function () {
        var items = document.querySelectorAll("#tag-list input[type='checkbox']")
        for (var i = 0; i < items.length; i++) {
            items[i].checked = false;
        }
    };
    Container.querySelector("[name='invert_select']").onclick = function () {
        var items = document.querySelectorAll("#tag-list input[type='checkbox']")
        for (var i = 0; i < items.length; i++) {
            items[i].checked == true ? items[i].checked = false : items[i].checked = true;
        }
    };
    Container.querySelector("[name='export']").onclick = function () {
        exportTags(`#tag-list input[type='checkbox']:checked`)
    };

    document.getElementById("set-weight").onchange = function (e){
        if(e.target.checked){
            document.querySelectorAll("#tag-list input[type='number']").forEach((e)=>e.hidden=false)
        }else{
            document.querySelectorAll("#tag-list input[type='number']").forEach((e)=>e.hidden=true)
        }
    }

})();
