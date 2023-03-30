const inv = document.getElementById('inv')
const Func = async (id) => {
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            otp: id
        })
    };

    try {
        let tmp = await fetch('/verify', options)
        tmp = await tmp.json()
        if (tmp.code == true) open('/password', "_self")
        else {
            inv.style.display = 'block'
            setTimeout(() => {
                inv.style.display = 'none'
            }, 2000)
        }
    } catch (error) {
        console.log(error);
    }
}
const verify = () => {
    let otp = ''
    const all = document.getElementsByTagName('input')
    for (let i = 0; i < all.length; i++) otp += all[i].value;
    Func(otp)
}