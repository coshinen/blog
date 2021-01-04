var tid;
var title = document.title;
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = 'また会おうぜ…';
        tid = setTimeout(function() {
            document.title = title;
        }, 2000);
    } else {
        clearTimeout(tid);
        document.title = title;
    }
});
