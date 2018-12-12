

//Objeto que guarda uma fila de objetos do tipo Pessoa
function Fila( _disciplina_de_atendimento )
{
    this.array = [];        // Array com todas as pessoas da fila (incluindo em serviço)
    this.disciplina = _disciplina_de_atendimento;   // "FCFS" ou "LCFS"
    //Insere uma pessoa na fila, levando em conta a disciplina
    this.push = function(newElement)
    {

        //Caso 'First come first service'
        if( this.disciplina == "FCFS" ){
            //Simplesmente vai pro final da fila
            this.array.push( newElement );
        }
        else
        //Caso 'Last come first service'
        if( this.disciplina == "LCFS" ){
            //Caso fila vazia, entra na posição 0
            if( this.array.length == 0 ){
                this.array.push( newElement );
            }
            //Caso contrário, sempre entra na posição 1 (imediatamente antes do elemento em serviço)
            else{
                this.array.splice(1,0,newElement);
            }
        }
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