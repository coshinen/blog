document.body.addEventListener('copy', function (ev) {
    if (window.getSelection().toString() && window.getSelection().toString().length > 42) {
        setClipboardData(ev);
        alert('署名-非商业性使用-禁止演绎 4.0 国际 (CC BY-NC-ND 4.0)\n\n'
            + '您可以自由地：\n\n'
            + '共享 — 在任何媒介以任何形式复制、发行本作品\n\n'
            + '只要你遵守许可协议条款，许可人就无法收回你的这些权利。\n\n'
            + '惟须遵守下列条件：\n\n'
            + '署名 — 您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否（对原始作品）作了修改。您可以用任何合理的方式来署名，但是不得以任何方式暗示许可人为您或您的使用背书。\n\n'
            + '非商业性使用 — 您不得将本作品用于商业目的。\n\n'
            + '禁止演绎 — 如果您再混合、转换、或者基于该作品创作，您不可以分发修改作品。\n\n'
            + '没有附加限制 — 您不得适用法律术语或者技术措施从而限制其他人做许可协议允许的事情。\n\n'
            + '声明：\n\n'
            + '您不必因为公共领域的作品要素而遵守许可协议，或者您的使用被可适用的例外或限制所允许。\n\n'
            + '不提供担保。许可协议可能不会给与您意图使用的所必须的所有许可。例如，其他权利比如形象权、隐私权或人格权可能限制您如何使用作品。');
    }
});

function setClipboardData(event) {
    var clipboardData = event.clipboardData || window.clipboardData;
    if (clipboardData) {
        event.preventDefault();

        var textData = '“' + window.getSelection().toString() + '”\n\n'
            + 'Excerpt From: '
            + 'mistydew\'s blog, '
            + window.location.href
            + '.';

        clipboardData.setData('text/plain', textData);
    }
};
