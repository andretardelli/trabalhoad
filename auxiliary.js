

//Objeto que guarda uma fila de objetos do tipo Pessoa
function Fila( _disciplina_de_atendimento)
{
    this.array = [];        // Array com todas as pessoas da fila (incluindo em serviço)
    this.disciplina = _disciplina_de_atendimento;   // "FCFS" ou "LCFS"
    this.contagem = []  // Array que diz quantas pessoas haviam na fila depois da n-ésima entrada
    this.n = 0;         // Numero de pessoas que ja entraram na fila
    //Insere uma pessoa na fila, levando em conta a disciplina
    this.push = function(newPerson)
    {

        //Caso 'First come first service'
        if( this.disciplina == "FCFS" ){
            //Simplesmente vai pro final da fila
            this.array.push( newPerson );
        }
        else
        //Caso 'Last come first service'
        if( this.disciplina == "LCFS" ){
            //Caso fila vazia, entra na posição 0
            if( this.array.length == 0 ){
                this.array.push( newPerson );
            }
            //Caso contrário, sempre entra na posição 1 (imediatamente antes do elemento em serviço)
            else{
                this.array.splice(1,0,newPerson);
            }
        }

        //Atualizamos contagem[]
        this.contagem[this.n] = this.array.length; 
        this.n = this.n + 1;
    };
    //Remove o elemento 0 da fila e o retorna.
    this.pop = function()
    {
        var sainte = this.array[0];
        this.array.splice(0,1);
        return sainte;
    };
    //Retorna se a fila está vazia
    this.vazia = function()
    {
        return (this.array.length === 0);
    }
}
//Objeto evento - possui 'senha' da pessoa, momento que ocorre e tipo de evento: chegada ou saida, 
function Evento(senha_pessoa, tempo_evento, tipo_evento){
    this.pessoa = senha_pessoa;
    this.tempo = tempo_evento;
    this.tipo = tipo_evento;
}

//cria toda lista de eventos na ordem que irao ocorrer
function criaListaEventos(listaEventos, gerador, mi, lambda, nmin){
    var tchegadas = [];
    var tsaidas = [];
    var proxchegada = 0;
    var proxsaida = 0;
    var ipessoa = 1;
    //define momento dos eventos de chegada e saida da primeira pessoa
    tchegadas[0] = new Evento(0, gerador.exponential( lambda ), 'chegada');
    tsaidas[0] =  new Evento(0, gerador.exponential( mi), 'saida');
    proxsaida = tsaidas[0];
    //add na lista evento chegada primeira pessoa
    listaEventos.push(tchegadas[0]);

    //adiciona na lista todos os eventos de chegada
    while(ipessoa < nmin){
        //caso evento ja tenho sido criado
        if(tchegadas[ipessoa]){
            //se proximo evento é chegada
            if(proxchegada.tempo < proxsaida.tempo){
                //add evento de chegada na lista
                listaEventos.push(proxchegada);
                ipessoa++;
            }
            //se proximo evento é saida
            else{
                //add evento de saida na lista
                listaEventos.push(proxsaida);
                //se ocorreram mesmo numero de chegada e saidas - fila esta vazia - prox saida depende da proxima chegada
                if(tchegadas.length == tsaidas.length){
                    tsaidas[proxsaida.pessoa+1] = new Evento(proxsaida.pessoa+1, (proxchegada.tempo+gerador.exponential( mi )), 'saida');
                    proxsaida = tsaidas[proxsaida.pessoa+1];
                }
                //se nao, proxima saida depende da ultima saida
                else{
                    tsaidas[proxsaida.pessoa+1] = new Evento(proxsaida.pessoa+1, (proxsaida.tempo+gerador.exponential( mi )), 'saida');
                    proxsaida = tsaidas[proxsaida.pessoa+1];
                }
            }
        }
        //cria evento de chegada para proxima pessoa
        else{
            tchegadas[ipessoa] = new Evento(ipessoa, (tchegadas[ipessoa-1].tempo + gerador.exponential( lambda )), 'chegada');
            proxchegada = tchegadas[ipessoa];
        }
    }

    //add na lista todas as saidas que ficaram faltando
    if(tchegadas.length > tsaidas.length){
        for(var spessoa = 0; spessoa<(tchegadas.length-tsaidas.length); spessoa++){
            tsaidas[spessoa] = new Evento(spessoa, (proxsaida.tempo+gerador.exponential( mi ), 'saida'));
            proxsaida = tsaidas[spessoa];
            listaEventos.push(proxsaida);
        }
    }
}

//Objeto tipo pessoa - possiu o momento que chegou, momento que entrou em serviço e momento de saida; senha indica o numero de pessoas que chegaram antes deste
function Pessoa( tempoDeChegada , rodada ){
    this.tempoDeChegada = tempoDeChegada;
    this.rodada         = rodada;
    this.tempoDeChegadaEmServico;
    this.tempoDeSaida;
}

//Passando um array com números, retorna a media desses valores.
function media( array_de_numeros ){
    var M = 0
    for( var i = 0 ; i < array_de_numeros.length ; i ++ ){
        M += array_de_numeros[i];
    }
    return ( M / array_de_numeros.length );
}

//Passando um array com números, retorna a variancia desses valores.
function variancia( array_de_numeros ){
    var V = 0;
    var M = media( array_de_numeros );
    for( var i = 0 ; i < array_de_numeros.length ; i ++ ){
        V += Math.pow( Math.abs(array_de_numeros[i] - M) , 2 ) ;
    }
    return ( V / array_de_numeros.length );
}

//Passando um array com objetos da classe 'Pessoa', retorna a media do tempo na fila de espera
function mediaTempoEmEspera( array_de_pessoas ){
    var temposDeEspera = []
    for( var i = 0 ; i < array_de_pessoas.length ; i++ ){
        temposDeEspera[i] = array_de_pessoas[i].tempoDeChegadaEmServico - array_de_pessoas[i].tempoDeChegada;
    }
    return media( temposDeEspera )
}

//Passando um array com objetos da classe 'Pessoa', retorna a variancia do tempo na fila de espera
function varianciaTempoEmEspera( array_de_pessoas ){
    var temposDeEspera = []
    for( var i = 0 ; i < array_de_pessoas.length ; i++ ){
        temposDeEspera[i] = array_de_pessoas[i].tempoDeChegadaEmServico - array_de_pessoas[i].tempoDeChegada;
    }
    return variancia( temposDeEspera )
}



//Retorna a precisão de um intervalo de confiança ( LOWER em [0] e UPPER em [1] ) 
function precisaoIC( _IC ){
    return ( _IC[1] - _IC[0] ) / ( _IC[1] + _IC[0] );
}