const btn_trajet = document.querySelector('#trajet-btn')
const btn_gare = document.querySelector('#gare-btn')
const btn_train = document.querySelector('#train-btn')


function renderForm(type) {
    let txt = ''
    if(type == "trajet"){
        txt ="<h3>N° de train</h3>"+
            "<form action=\"\" method=\"POST\" class=\"w-100 p-5 bg-white bg-opacity-70 flex items-center\">\n" +
            "                    <div class=\"w-2/5 flex items-center\">\n" +
            "                        <input type=\"text\" name=\"name\"\n" +
            "                               class=\"h-8 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none\"\n" +
            "                               placeholder=\"Numero De Train\" required>\n" +
            "                    </div>\n" +
            "                </form>"
    }else if(type == "gare"){

    }else{

    }
}

btn_trajet.addEventListener('click', ()=>{
    console.log("Btn trajet click")
})

btn_gare.addEventListener('click', ()=>{
    console.log("Btn gare click")
})

btn_train.addEventListener('click', ()=>{
    renderForm("trajet")
})