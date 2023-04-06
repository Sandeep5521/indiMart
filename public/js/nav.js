const func = async () => {
    let tmp = await fetch('https://dummyjson.com/products/categories')
    tmp = await tmp.json()
    let category = document.getElementById('category')
    console.log(tmp);
    for (let i = 0; i < tmp.length - 3; i++) {
        category.innerHTML += `<li><a class="dropdown-item text-black" href="/shop?cat=${tmp[i]}">${tmp[i]}</a></li>`
    }
}
func()