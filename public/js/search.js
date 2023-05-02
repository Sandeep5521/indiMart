const search = () => {
    const q = document.getElementById('inp').value;
    open(`/search?s=${q}`, '_self');
}
document.getElementById('inp').addEventListener("keyup", function (event) {
    if (event.key === "Enter") { // 13 is the code for the "Enter" key
        search();
    }
});