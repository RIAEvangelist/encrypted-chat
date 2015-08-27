window.addEventListener(
    'DOMContentLoaded',
    initIM
);

function initIM(){
    var el=document.querySelector('.dm');
    el.addEventListener(
        'click',
        function(e){
            switch(e.target.id){
                case 'send' :
                    sendIM();
                    break;
                case 'IMCreate' :
                    createIM();
                    break;
                case 'IMCipherShow' :
                    showCipher();
                    break;
                case 'IMCustomServer' :
                    showServer();
                    break;
                default :
                    return;
            }
        }
    )
}

function sendIM(){
    app.trigger(
        'encrypt',
        document.getElementById('IMInput').value,
        app.data.cipher,
        sendEncrypted
    )
}

function sendEncrypted(data){
    app.data.socket.send(
        JSON.stringify(
            {
                to  : app.data.to,
                data: data
            }
        )
    );

     document.getElementById('IMDisplay').value=app.data.you+' : '+
        document.getElementById('IMInput').value+'\n--------------\n'+
        document.getElementById('IMDisplay').value;

    document.getElementById('IMInput').value='';
}

function createIM(){
    app.data.you     = document.getElementById('you').value,
    app.data.them    = document.getElementById('them').value,
    app.data.cipher  = document.getElementById('IMCipher').value;

    app.data.as=app.data.you+app.data.them;
    app.data.to=app.data.them+app.data.you;

    document.getElementById('login').classList.add('hidden');
    document.getElementById('messenger').classList.remove('hidden');

    retrySocket();

    document.getElementById('DMTitle').innerHTML='DM with '+app.data.them;
}

function retrySocket(){
    if(app.data.socket)
        if(app.data.socket.readyState==1)
            return;

    app.data.socket = new WebSocket("ws://anon.diginow.it:11505");
    app.data.socket.onmessage=socketMessage;
    app.data.socket.onclose=function(){
            document.getElementById('error').classList.remove('hidden');
            setTimeout(
                retrySocket,
                1500
            );
        }
}

function socketMessage(message){
    try{
        var data=JSON.parse(
            message.data
        );
    }catch(err){
        return;
    }

    document.getElementById('error').classList.add('hidden');

    if(data.question){
        app.data.socket.send(
            JSON.stringify(
                {
                    answer:app.data.as
                }
            )
        );
        return;
    }

    if(!data.data)
        return;

    app.trigger(
        'decrypt',
        data.data,
        app.data.cipher,
        showMessage
    );
}

function showMessage(data){
    if(!data)
        return;

    document.getElementById('IMDisplay').value=app.data.them+' : '+
        data+'\n--------------\n'+
        document.getElementById('IMDisplay').value;
}

function showCipher(){
    var cipher=document.getElementById('IMCipher');

    if(cipher.getAttribute('type')=='password'){
        cipher.setAttribute('type','text')
        return;
    }

    cipher.setAttribute('type','password');
}

function showServer(){
    document.getElementById('IMServer').classList.toggle('hidden');
    document.getElementById('IMNet').classList.toggle('hidden');
}
