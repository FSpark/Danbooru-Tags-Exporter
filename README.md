<div align="center"><h1> Danbooru Tags Sort Exporter</h1></div>
<div align="center">
<a href="https://greasyfork.org/ja/scripts/484998-danbooru-tags-select-to-sort-and-export">
<img  src="https://img.shields.io/static/v1?label=%20&message=GreasyFork&style=flat-square&labelColor=7B0000&color=960000&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3ggEBCQHM3fXsAAAAVdJREFUOMudkz2qwkAUhc/goBaGJBgUtBCZyj0ILkpwAW7Bws4yO3AHLiCtEFD8KVREkoiFxZzX5A2KGfN4F04zMN+ce+5c4LMUgDmANYBnrnV+plBSi+FwyHq9TgA2LQpvCiEiABwMBtzv95RSfoNEHy8DYBzHrNVqVEr9BWKcqNFoxF6vx3a7zc1mYyC73a4MogBg7vs+z+czO50OW60Wt9stK5UKp9Mpj8cjq9WqDTBHnjAdxzGQZrPJw+HA31oulzbAWgLoA0CWZVBKIY5jzGYzdLtdE9DlcrFNrY98zobqOA6TJKHW2jg4nU5sNBpFDp6mhVe5rsvVasUwDHm9Xqm15u12o+/7Hy0gD8KatOd5vN/v1FozTVN6nkchxFuI6hsAAIMg4OPxMJCXdtTbR7JJCMEgCJhlGUlyPB4XfumozInrupxMJpRSRtZlKoNYl+m/6/wDuWAjtPfsQuwAAAAASUVORK5CYII="></a>

<p>Select specified tags and copy to clipboard, for Stable Diffusion WebUI or NovelAI to use.<br>
Tags can be sorted by tag order in NovelAI method.</p>
<p>指定したタグを選択し、クリップボードにコピーして、Stable Diffusion WebUIやNovelAIなどで使用することができます。<br>
タグをNovelAI方式のタグ順序で並べ替えることが可能です。</p>

Forked from [FSpark/Danbooru-Tags-Exporter](https://github.com/FSpark/Danbooru-Tags-Exporter)
</div>

# Description
Added the ability to sort tags by NovelAI method tag order in addition to the original functionality.<br>
2024-01-23 Added ability to save export settings. Settings changed on the web page are saved to local storage and applied when revisiting.<br>
<br>
元の機能に加えてタグをNovelAI方式のタグ順序で並べ替える機能を追加。<br>
2024-01-23 書き出し設定の保存機能を追加。ウェブページ上で変更した設定はローカルストレージに保存され、再訪時に適用されます。<br>
<br>

Tag order in NovelAI method.
```
1boy, 1girl, characters, series, everything else in any order
```
<br>

For Example(Stable Diffusion WebUI)
```
1girl, kirisame marisa, touhou, tian \(my dear\), basket, (((blonde hair))), [[curly hair]], eyebrows hidden by hair, floating hair, forest, hair between eyes, hat, holding, holding basket, long hair, looking at viewer, looking back, nature, outdoors, solo, squatting, tree, witch, witch hat, yellow eyes
```
<br>

For Example(NovelAI)
```
1girl, kirisame marisa, touhou, tian (my dear), basket, {{{blonde hair}}}, [[curly hair]], eyebrows hidden by hair, floating hair, forest, hair between eyes, hat, holding, holding basket, long hair, looking at viewer, looking back, nature, outdoors, solo, squatting, tree, witch, witch hat, yellow eyes
```
<br>

# Screenshot
![UI](https://github.com/Takenoko3333/Danbooru-Tags-Sort-Exporter/assets/153407565/a155f18a-62e9-4ef1-9426-af2b6ce7b023)

Will be exported as `1girl, kirisame marisa, touhou, tian (my dear), basket, {{{blonde hair}}}, [[curly hair]], eyebrows hidden by hair, floating hair, forest, hair between eyes, hat, holding, holding basket, long hair, looking at viewer, looking back, nature, outdoors, solo, squatting, tree, witch, witch hat, yellow eyes`

> For display function only, the source of the picture is https://pixiv.net/artworks/102093005, thanks.

# Install
[Greasyfork](https://greasyfork.org/ja/scripts/484998-danbooru-tags-select-to-sort-and-export)
<br><br>

# Change log
## [0.5.0] - 2024-01-23
### Added
- Added ability to save export settings to local storage.
- 書き出し設定のローカルストレージ保存機能を追加。

## [0.4.2] - 2024-01-22
### Fixed
- Fixed code.
- コードを修正。

## [0.4.1] - 2024-01-17
### Added
- Added polyfill.js
- polyfill.jsを追加。

## [0.4.0] - 2024-01-17
### Added
- Added the ability to sort tags by NovelAI method tag order in addition to the original functionality.
- 元の機能に加えてタグをNovelAI方式のタグ順序で並べ替える機能を追加。
<br><br>

## License
The AGPL-3.0 License.
