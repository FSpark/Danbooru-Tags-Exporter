// ==UserScript==
// @name         Danbooru Tags Select to Sort and Export
// @name:zh-TW   Danbooru 標籤 選擇排序和匯出器
// @name:zh-HK   Danbooru 標籤 選擇排序和匯出器
// @name:zh-CN   Danbooru 标签 选择排序和导出器
// @name:ja      Danbooru Tags Select to Sort and Export
// @namespace    https://github.com/Takenoko3333/Danbooru-Tags-Sort-Exporter
// @supportURL   https://github.com/Takenoko3333/Danbooru-Tags-Sort-Exporter/issues
// @homepageURL  https://github.com/Takenoko3333/Danbooru-Tags-Sort-Exporter
// @version      0.4.0
// @description  Select specified tags and copy to clipboard, for Stable Diffusion WebUI or NovelAI to use. Tags can be sorted by tag order in NovelAI method.
// @description:zh-TW  選擇指定標籤並複製到剪貼板，供Stable Diffusion WebUI或NovelAI等使用。標籤可根據 NovelAI 的標籤排序方法進行排序。
// @description:zh-HK  選擇指定標籤並複製到剪貼板，供Stable Diffusion WebUI或NovelAI等使用。標籤可根據 NovelAI 的標籤排序方法進行排序。
// @description:zh-CN  选择指定标签并复制到剪贴板，供Stable Diffusion WebUI或NovelAI等使用。标签可根据 NovelAI 的标签排序方法进行排序。
// @description:ja  指定したタグを選択し、クリップボードにコピーして、Stable Diffusion WebUIやNovelAIなどで使用することができます。タグをNovelAI方式のタグ順序で並べ替えることが可能です。
// @author       Takenoko3333
// @match        https://danbooru.donmai.us/posts/*
// @match        https://safebooru.donmai.us/posts/*
// @match        https://aibooru.online/posts/*
// @match        https://betabooru.donmai.us/posts/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=donmai.us
// @grant        GM.setClipboard
// @grant        GM.notification
// @grant        GM.addStyle
// @license      AGPL-3.0
// ==/UserScript==

(function () {
    'use strict';

    // ==Setting==
    const sortInitial = true; // Sorted by tag order in NovelAI method (タグをNovelAI方式で並び替える)
    const bracketEscapeInitial = false; // true: Stable Diffusion, false: NovelAI
    const roundBracketsSelectInitial = 1; // 0: ( ) Stable Diffusion, 1: { } NovelAI
    // ==/Setting==

    let bracketEscapeCheck = "";
    let sortCheck = "";
    let roundBracketsCheck0 = "";
    let roundBracketsCheck1 = "";
    let roundBracketsValue0 = -1;
    let roundBracketsValue1 = -1;

    if(bracketEscapeInitial) {
        bracketEscapeCheck = "checked";
    }
    if(sortInitial) {
        sortCheck = "checked";
    }
    if(roundBracketsSelectInitial) {
        roundBracketsCheck1 = "checked";
        roundBracketsValue1 = 0;
    } else {
        roundBracketsCheck0 = "checked";
        roundBracketsValue0 = 0;
    }

    GM.addStyle(`#tags-exporter-setting button, #tag-list button {margin: 0.25rem 0 0.5rem 0; padding: 0.25em 0.75em;}
                #tags-exporter-setting label{margin: .25em; line-height: 1.5em;}
               .tag-weight {width: 3em; margin-left: .25em}`);

    let SettingPanel = document.createElement('section');
    SettingPanel.id = "tags-exporter-setting";
    SettingPanel.innerHTML = `
      <h2>Tags Export Settings</h2>
<input type="checkbox" id="sort" ${sortCheck}/><label for="sort">Sort by NovelAI method</label><br>
<input type="checkbox" id="bracket-escape" ${bracketEscapeCheck}/><label for="bracket-escape"><code>(</code> <code>)</code> -> <code>\\(</code> <code>\\)</code></label><br>
<input type="checkbox" id="set-weight" /><label for="set-weight">Setting weights</label><br>
<div>
 <input type="radio" name="use-bracket" id="round-brackets" value="${roundBracketsValue0}" ${roundBracketsCheck0}/><label for="round-brackets">Using ( )</label>
<input type="radio" name="use-bracket" id="curly-brackets" value="${roundBracketsValue1}" ${roundBracketsCheck1}/><label for="curly-brackets">Using { }</label></div>
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

    insertAfter(SettingPanel, document.querySelector("#search-box"))
    insertAfter(Container, document.querySelector("#tags-exporter-setting > h2"))

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
        let reorderedTags = []
        let bracket_escape = document.getElementById("bracket-escape").checked
        let set_weight = document.getElementById("set-weight").checked
        let round_brackets = document.getElementById("round-brackets").checked
        let sort = document.getElementById("sort").checked
        if(!target) {
            if(sort) {
                ["[name=character-tags]:checked","[name=copyright-tags]:checked",,"[name=artist-tags]:checked","[name=general-tags]:checked"].forEach((t)=>createTags(t));
            } else {
                createTags(`#tag-list input[type='checkbox']:checked`);
            }
        } else {
            createTags(target);
        }
        function createTags(target) {
            document.querySelectorAll(target).forEach((e) => {
                let prompts = e.value
                if(bracket_escape)
                    prompts = prompts.replaceAll(`(`,`\\(`).replaceAll(`)`,`\\)`)
                if(set_weight){
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
            reorderedTags = [...girlsTags, ...boysTags, ...otherTags];
        } else {
            reorderedTags = tags;
        }
        let res = reorderedTags.join(", ")

        GM.setClipboard(res)
        GM.notification(`${reorderedTags.length} tag(s) were copied.`, "Danbooru Tags Sort and Exporter")
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
            chk.checked = true
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

    ["artist-tag","character-tag","copyright-tag","general-tag"].forEach((t)=>insertButtons(t))


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
        exportTags()
    };

    document.getElementById("set-weight").onchange = function (e){
        if(e.target.checked){
            document.querySelectorAll("#tag-list input[type='number']").forEach((e)=>e.hidden=false)
        }else{
            document.querySelectorAll("#tag-list input[type='number']").forEach((e)=>e.hidden=true)
        }
    }

})();
