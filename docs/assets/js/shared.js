function $tabs(n) {
    var tab = '\u00a0\u00a0',
        str = tab;
    for (let i = 1; i <= n || 0; i++)
        str += tab;
    return str;
}

function codeToStr(c) {
    var t = (c + '');
    t = t.substr('function(){'.length);
    return t.substr(0, t.length - 1);
}