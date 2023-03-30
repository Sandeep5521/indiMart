const resend = document.getElementById('send')
const func = async (id) => {
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email:id,
            active:true
        })
    };

    try {
        let tmp = await fetch('/forget', options)
        tmp = await tmp.json()
        console.log(tmp);
        const txt = resend.innerHTML
        resend.innerText = 'Sended'
        setTimeout(()=>{
            resend.innerHTML = txt
        },3000)
    } catch (error) {
        console.log("fuck");
    }
}
const send = () =>{
    const id = document.getElementById('mail')
    func(id.innerText)
}