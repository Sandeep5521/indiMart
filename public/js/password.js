const inv = document.getElementById('inv')
const suck = document.getElementById('suck')
const Func = async (pid) => {
    const options = {
        method: 'PATCH',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            password: pid
        })
    };

    try {
        let tmp = await fetch('/password', options)
        tmp = await tmp.json()
        console.log(tmp);
        suck.style.display = 'block'
        setTimeout(() => {
            open('/', "_self")
            suck.style.display = 'none'
        }, 1000)
    } catch (error) {
        console.log('fuck');
    }
}

const check = () => {
    const n = document.getElementById('n')
    const c = document.getElementById('c')
    if (n.value != c.value) {
        inv.style.display = 'block'
        setTimeout(() => {
            inv.style.display = 'none'
        }, 2000)
    }
    else if (n.value == '' && c.value == '') {
        inv.style.display = 'block'
        setTimeout(() => {
            inv.style.display = 'none'
        }, 2000)
    }
    else Func(n.value)
}