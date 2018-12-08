

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
            

            //Acho que não tem problema não usar sort toda hora que insere
            //this.array.sort(function(a, b){return a.eventStartTime- b.eventStartTime});
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
            
            //Acho que não tem problema não usar sort toda hora que insere
            //No caso de LCFS, usar sort sempre é um problema (pode interromper o serviço atual)
            //this.array.sort(function(a, b){return a.eventStartTime- b.eventStartTime});
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
    var media = 0
    for( var i = 0 ; i < array_de_numeros.length ; i ++ )
        media += array_de_numeros[i]
    media = media / array_de_numeros.length
    return media
}

//Passando um array com números, retorna a variancia desses valores.
function variancia( array_de_numeros ){
    var variancia = 0
    var media = media( array_de_numeros )
    for( var i = 0 ; i < array_de_numeros.length ; i ++ )
        media += array_de_numeros[i]
    media = media / array_de_numeros.length
    return media
}

//Passando um array com objetos da classe 'Pessoa', retorna a media do tempo em fila
function mediaTempoEmFila( array_de_pessoas ){
    var media = 0;
    for( var i = 0 ; i < array_de_pessoas.length ; i++ ){
        var tempo_em_fila = array_de_pessoas[i].tempoDeSaida - array_de_pessoas[i].tempoDeChegada
        media += tempo_em_fila
    }
    media = media / array_de_pessoas.length
    //console.log(media)
    return media
}

//Passando um array com objetos da classe 'Pessoa', retorna a variancia do tempo em fila
function varianciaTempoEmFila( array_de_pessoas ){
    var variancia = 0;
    var media = mediaTempoEmFila(array_de_pessoas)
    for( var i = 0 ; i < array_de_pessoas.length ; i++ ){
        var tempo_em_fila = array_de_pessoas[i].tempoDeSaida - array_de_pessoas[i].tempoDeChegada
        variancia += Math.pow( Math.abs(tempo_em_fila-media) , 2 ) 
    }
    variancia = variancia / array_de_pessoas.length
    return variancia
}

