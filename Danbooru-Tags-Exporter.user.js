// ==UserScript==
// @name         Danbooru Tags Select to Sort and Export
// @name:zh-TW   Danbooru 標籤 選擇排序和匯出器
// @name:zh-HK   Danbooru 標籤 選擇排序和匯出器
// @name:zh-CN   Danbooru 标签 选择排序和导出器
// @name:ja      Danbooru Tags Select to Sort and Export
// @namespace    https://github.com/Takenoko3333/Danbooru-Tags-Sort-Exporter
// @supportURL   https://github.com/Takenoko3333/Danbooru-Tags-Sort-Exporter/issues
// @homepageURL  https://github.com/Takenoko3333/Danbooru-Tags-Sort-Exporter
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @version      0.8.1
// @description  Select specified tags and copy to clipboard, for Stable Diffusion WebUI or NovelAI to use. Tags can be sorted by tag order in NovelAI method.
// @description:zh-TW  選擇指定標籤並複製到剪貼板，供Stable Diffusion WebUI或NovelAI等使用。標籤可根據 NovelAI 的標籤排序方法進行排序。
// @description:zh-HK  選擇指定標籤並複製到剪貼板，供Stable Diffusion WebUI或NovelAI等使用。標籤可根據 NovelAI 的標籤排序方法進行排序。
// @description:zh-CN  选择指定标签并复制到剪贴板，供Stable Diffusion WebUI或NovelAI等使用。标签可根据 NovelAI 的标签排序方法进行排序。
// @description:ja  指定したタグを選択し、クリップボードにコピーして、Stable Diffusion WebUIやNovelAIなどで使用することができます。タグをNovelAI方式のタグ順序で並べ替えることが可能です。
// @author       Takenoko3333
// @match        https://danbooru.donmai.us/posts/*
// @match        https://aibooru.online/posts/*
// @match        https://betabooru.donmai.us/posts/*
// @match        https://e621.net/posts/*
// @match        https://gelbooru.com/index.php?page=post&s=view*
// @match        https://rule34.xxx/index.php?page=post&s=view*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=donmai.us
// @grant        GM.setClipboard
// @grant        GM.notification
// @grant        GM.addStyle
// @license      AGPL-3.0
// ==/UserScript==

// Forked from FSpark/Danbooru-Tags-Exporter(https://github.com/FSpark/Danbooru-Tags-Exporter)

(function () {
    'use strict';

    // Settings changed on the web page are saved to local storage and applied when revisiting.
    // ウェブページ上で変更した設定はローカルストレージに保存され、再訪時に適用されます。

    // ==Settings==
    const initialSettings = {
        sort: true, // Sorted by tag order in NovelAI method. (タグをNovelAI方式で並び替える)
        bracketEscape: false, // true: Stable Diffusion, false: NovelAI
        setWeight: false, // true: Show and Activate weight inputs. (ウェイト入力の表示と有効化)
        useBracket: 1, // 0: ( ) Stable Diffusion, 1: { } NovelAI
        selections: {artist: true, copyright: true, character: true, species: true, general: true} // Pre-checked state for each category. (カテゴリ毎の初期選択状態)
    };
    // ==/Settings==

    let settings = {};
    let localSettings = JSON.parse(localStorage.getItem("settings")) || {};
    for (let key in initialSettings) {
        if (localSettings[key] === undefined) {
            settings[key] = initialSettings[key];
        } else {
            settings[key] = localSettings[key];
        }
    }
    localStorage.setItem("settings", JSON.stringify(settings));
    // console.log(settings)

    let sortCheck = "";
    let bracketEscapeCheck = "";
    let setWeightCheck = "";
    let roundBracketsRadio = "";
    let curlyBracketsRadio = "";
    let selectArtistCheck = "";
    let selectCopyrightCheck = "";
    let selectCharacterCheck = "";
    let selectSpeciesCheck = "";
    let selectGeneralCheck = "";

    if(settings.sort) {
        sortCheck = "checked";
    }
    if(settings.bracketEscape) {
        bracketEscapeCheck = "checked";
    }
    if(settings.setWeight) {
        setWeightCheck = "checked";
    }
    if(settings.useBracket) {
        curlyBracketsRadio = "checked";
    } else {
        roundBracketsRadio = "checked";
    }
    if(settings.selections) {
        if(settings.selections.artist) {
            selectArtistCheck = "checked";
        }
        if(settings.selections.copyright) {
            selectCopyrightCheck = "checked";
        }
        if(settings.selections.character) {
            selectCharacterCheck = "checked";
        }
        if(settings.selections.species) {
            selectSpeciesCheck = "checked";
        }
        if(settings.selections.general) {
            selectGeneralCheck = "checked";
        }
    }

    let isRule34 = location.hostname == "rule34.xxx";
    let tagListSelector = isRule34 ? "#tag-sidebar" : "#tag-list";

    GM.addStyle(`#tags-exporter-setting button, ${tagListSelector} button {margin: 0.25rem 0 0.5rem 0; padding: 0.25em 0.55em;}
                 #tags-exporter-setting button#reset-settings {margin-top: .5em}
                 #tags-exporter-setting label {display: inline-block; padding: .1em .25em; line-height: 1.5em; font-weight: normal;}
                 #tags-exporter-setting .heading {margin-top: .25em; line-height: 1.5em;}
                 #tags-exporter-setting .inline-checkbox {display: inline-block;}
                 #tags-exporter-setting .use-bracket {margin-left: 1.3em;}
                 ${tagListSelector} input[type='checkbox'] {margin-right: .4em; vertical-align: text-bottom;}
                 .tag-weight {width: 3em; margin-right: .4em}
                `);

    if (location.hostname == "gelbooru.com") {
        GM.addStyle(`#tags-exporter-setting {margin: 0 10px 0 25px;}
                     #tags-exporter-setting h2 {font-size: 1.2em;}
                     #tags-exporter-setting .heading {font-weight: bold}
                     #tags-exporter-setting button,  ${tagListSelector} button {padding: 0.25em 0.4em;}
                     [id$="-tag-buttons"] {margin: 0 4px 0 15px;}
                     .tag-weight {width: 2.5em;}
                    `);
    }

    if (location.hostname == "rule34.xxx") {
        GM.addStyle(`#tags-exporter-setting {margin: 10px 0;}
                     #tags-exporter-setting h2 {font-size: 1.2em;}
                     #tags-exporter-setting .heading {font-weight: bold}
                     #tags-exporter-setting button,  ${tagListSelector} button {padding: 0.25em 0.4em;}
                     #tags-exporter-setting input, [class^="tag-type-"] input {margin: 0;}
                     input.tag-weight {width: 2.5em; padding: 0 0 0 .1em;}
                     ${tagListSelector} h6 {margin-top: 13px;}
                    `);

        for (let i = 0; i < document.styleSheets.length; i++) {
            let href = document.styleSheets[i].href;
            if (href) {
                let fileName = href.split('/').pop();
                if (fileName.startsWith('mobile.css')) {
                    GM.addStyle(`#tags-exporter-setting {text-align: center;}
                     #tags-exporter-setting input, ${tagListSelector} input[type='checkbox'] {height: 27px; vertical-align: middle; transform: scale(1.5);}
                     #tags-exporter-setting input {margin: 0 0.2em}
                     ${tagListSelector} input[type='checkbox'] {margin-right: 0.6em;}
                     #tags-exporter-setting .use-bracket {margin-left: 0;}
                    `);
                }
            }
        }
    }

    if (location.hostname != "e621.net") {
        GM.addStyle(`#tags-exporter-setting .show-e621 {display: none;}
                    `);
    }

    if (location.hostname == "e621.net") {
        GM.addStyle(`#tags-exporter-setting h2 {font-size: 1.16667em;}
                     #tags-exporter-setting .show-e621 {display: inline-block;}
                     .tag-list-header {margin-bottom: 2px;}
                     ul + .tag-list-header {margin-top: 8px;}
                     .tag-weight {width: 2.5em; padding: 1px;}
                    `);
    }

    let SettingPanel = document.createElement('section');
    SettingPanel.id = "tags-exporter-setting";
    SettingPanel.innerHTML = `
        <h2>Tags Export Settings</h2>
        <input type="checkbox" id="sort" ${sortCheck}/><label for="sort">Sort by NovelAI method</label><br>
        <input type="checkbox" id="bracket-escape" ${bracketEscapeCheck}/><label for="bracket-escape"><code>(</code> <code>)</code> -> <code>\\(</code> <code>\\)</code></label><br>
        <input type="checkbox" id="set-weight"  ${setWeightCheck}/><label for="set-weight">Setting weights</label><br>
        <div class="use-bracket">
        <input type="radio" name="use_bracket" id="round-brackets" value="0" ${roundBracketsRadio}/><label for="round-brackets">Using ( )</label>
        <input type="radio" name="use_bracket" id="curly-brackets" value="1" ${curlyBracketsRadio}/><label for="curly-brackets">Using { }</label>
        </div>
        <div>
        <div class="heading">Pre-checked</div>
        <span class="inline-checkbox"><input type="checkbox" id="select-artist" ${selectArtistCheck}/><label for="select-artist">Artist</label></span>
        <span class="inline-checkbox"><input type="checkbox" id="select-copyright" ${selectCopyrightCheck}/><label for="select-copyright">Copyright</label></span>
        <span class="inline-checkbox"><input type="checkbox" id="select-character" ${selectCharacterCheck}/><label for="select-character">Character</label></span>
        <span class="inline-checkbox show-e621"><input type="checkbox" id="select-species" ${selectGeneralCheck}/><label for="select-species">Species</label></span>
        <span class="inline-checkbox"><input type="checkbox" id="select-general" ${selectGeneralCheck}/><label for="select-general">General</label></span>
        </div>
        <button name="reset_settings" id="reset-settings">Settings Reset</button>
        `
	let Container = document.createElement('div');
    Container.id = "tags-exporter-container";
    Container.innerHTML = `
        <button name="select_all">All</button>
        <button name="select_none">None</button>
        <button name="invert_select">Invert</button>
        <button name="export">Export</button>
        `

    function insertBefore(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }

    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    if (location.hostname == "gelbooru.com" || location.hostname == "rule34.xxx") {
        insertBefore(SettingPanel, document.querySelector(tagListSelector));
    } else {
        insertAfter(SettingPanel, document.querySelector("#search-box"));
    }
    insertAfter(Container, document.querySelector("#tags-exporter-setting > h2"));

    function addBrackets(prompts,isRound,n){
        let l,r;
        if(n==0) {
            return prompts
        }
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
        let reorderedTags = []
        let sort = document.getElementById("sort").checked
        let bracket_escape = document.getElementById("bracket-escape").checked
        let set_weight = document.getElementById("set-weight").checked
        let round_brackets = document.getElementById("round-brackets").checked
        if(!target) {
            if(sort) {
                ["[name=character-tags]:checked", "[name=copyright-tags]:checked", "[name=artist-tags]:checked", "[name=species-tags]:checked", "[name=general-tags]:checked"].forEach((t)=>createTags(t));
            } else {
                createTags(`${tagListSelector} input[type='checkbox']:checked`);
            }
        } else {
            createTags(target);
        }
        function createTags(target) {
            document.querySelectorAll(target).forEach((e) => {
                let prompts = e.value
                if(bracket_escape) {
                    prompts = prompts.replaceAll(`(`,`\\(`).replaceAll(`)`,`\\)`)
                }
                if(set_weight) {
                    prompts = addBrackets(prompts,round_brackets,e.nextSibling.value)
                }
                tags.push(prompts)
            })
        }

        if(sort) {
            const regexp = /[1-6]\+?(girl|boy)s?/;
            const girlsTags = tags.filter(tag => tag.includes('girl') && regexp.test(tag));
            const boysTags = tags.filter(tag => !tag.includes('girl') && regexp.test(tag));
            const otherTags = tags.filter(tag => !regexp.test(tag));
            reorderedTags = [...boysTags, ...girlsTags, ...otherTags];
        } else {
            reorderedTags = tags;
        }
        let res = reorderedTags.join(", ")

        GM.setClipboard(res)
        GM.notification(`${reorderedTags.length} tag(s) were copied.`, "Danbooru Tags Sort and Exporter")
    }

    function insertButtons(target){
        let head = document.querySelector(`h3.${target}-tag-list`)
        if (location.hostname == "gelbooru.com" || location.hostname == "rule34.xxx") {
            head = document.querySelector(`.tag-type-${target}`)
        }
        if (location.hostname == "e621.net") {
            head = document.querySelector(`.${target}-tag-list`)
        }
        if(!head) return;
        let buttonContainer = Container.cloneNode(true)
        buttonContainer.id = `${target}-tag-buttons`
        if (location.hostname == "gelbooru.com" || location.hostname == "rule34.xxx" || location.hostname == "e621.net") {
            insertBefore(buttonContainer, head)
        } else {
            insertAfter(buttonContainer, head)
        }

        let tagItem = `.${target}-tag-list>li`;
        if (location.hostname == "gelbooru.com" || location.hostname == "rule34.xxx") {
            tagItem = `.tag-type-${target}`;
        }

        document.querySelectorAll(tagItem).forEach((e) => {
            let chk = document.createElement('input');
            chk.type = "checkbox"
            chk.name = `${target}-tags`
            if (location.hostname == "gelbooru.com" || location.hostname == "rule34.xxx" || location.hostname == "e621.net") {
                let aTags = e.querySelectorAll('a');
                if (aTags.length > 0) {
                    let lastATag = aTags[aTags.length - 1];
                    chk.value = lastATag.textContent;
                }
            } else {
                chk.value = e.dataset.tagName.replaceAll("_", " ")
            }
            if(settings.selections[target.replace("-tag", "")]) {
                chk.checked = true
            }
            e.insertBefore(chk, e.firstChild)

            let nbr = document.createElement('input');
            nbr.type = "number"
            nbr.name = `${target}-tags-weight`
            nbr.className = "tag-weight"
            nbr.value = 0
            nbr.hidden = true
            insertAfter(nbr,chk)
        })

        buttonContainer.querySelector("[name='select_all']").onclick = function () {
            var items = document.getElementsByName(`${target}-tags`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked = true;

            }
        };
        buttonContainer.querySelector("[name='select_none']").onclick = function () {
            var items = document.getElementsByName(`${target}-tags`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked = false;

            }
        };
        buttonContainer.querySelector("[name='invert_select']").onclick = function () {
            var items = document.getElementsByName(`${target}-tags`);
            for (var i = 0; i < items.length; i++) {
                items[i].checked == true ? items[i].checked = false : items[i].checked = true;

            }
        };
        buttonContainer.querySelector("[name='export']").onclick = function () {
            exportTags(`[name=${target}-tags]:checked`)
        };
    }

    function setSettings() {
        let sort = document.getElementById("sort").checked;
        let bracketEscape = document.getElementById("bracket-escape").checked;
        let setWeight = document.getElementById("set-weight").checked;
        let roundBrackets = document.getElementById("round-brackets").checked;
        let useBracket = roundBrackets ? 0 : 1;
        let selections = {artist: document.getElementById("select-artist").checked,
                          copyright: document.getElementById("select-copyright").checked,
                          character: document.getElementById("select-character").checked,
                          species: document.getElementById("select-species").checked,
                          general: document.getElementById("select-general").checked
                         };
        localStorage.setItem("settings", JSON.stringify({sort: sort, bracketEscape: bracketEscape, setWeight: setWeight, useBracket: useBracket, selections: selections}));
        // console.log(JSON.parse(localStorage.getItem("settings")));
    }

    function resetSettings() {
        localStorage.removeItem("settings");
        document.getElementById("sort").checked = initialSettings.sort;
        document.getElementById("bracket-escape").checked = initialSettings.bracketEscape;
        document.getElementById("set-weight").checked = initialSettings.setWeight;
        if(initialSettings.useBracket) {
            document.getElementById("curly-brackets").checked = true;
        } else {
            document.getElementById("round-brackets").checked = true;
        }
        toggleWeightInputs();
        document.getElementById("select-artist").checked = initialSettings.selections.artist;
        document.getElementById("select-copyright").checked = initialSettings.selections.copyright;
        document.getElementById("select-character").checked = initialSettings.selections.character;
        document.getElementById("select-species").checked = initialSettings.selections.species;
        document.getElementById("select-general").checked = initialSettings.selections.general;
    }

    function toggleWeightInputs(event) {
        const target = event ? event.target : document.getElementById('set-weight');
        if (target && target.id === 'set-weight') {
            const isSetWeightChecked = target.checked;
            document.querySelectorAll(`${tagListSelector} input[type='number']`).forEach(e => { e.hidden = !isSetWeightChecked; });
        }
    }

    ["artist","character","copyright", "species", "general"].forEach((t)=>insertButtons(t))

    toggleWeightInputs();

    Container.querySelector("[name='select_all']").onclick = function () {
        var items = document.querySelectorAll(`${tagListSelector} input[type='checkbox']`)
        for (var i = 0; i < items.length; i++) {
            items[i].checked = true;
        }
    };
    Container.querySelector("[name='select_none']").onclick = function () {
        var items = document.querySelectorAll(`${tagListSelector} input[type='checkbox']`)
        for (var i = 0; i < items.length; i++) {
            items[i].checked = false;
        }
    };
    Container.querySelector("[name='invert_select']").onclick = function () {
        var items = document.querySelectorAll(`${tagListSelector} input[type='checkbox']`)
        for (var i = 0; i < items.length; i++) {
            items[i].checked == true ? items[i].checked = false : items[i].checked = true;
        }
    };
    Container.querySelector("[name='export']").onclick = function () {
        exportTags()
    };
    SettingPanel.querySelector("[name='reset_settings']").onclick = function () {
        resetSettings()
    };
    SettingPanel.querySelectorAll("input[type='radio'], input[type='checkbox']").forEach(e => {
        e.onchange = function (event) {
            setSettings();
            toggleWeightInputs(event);
        };
    });

})();
