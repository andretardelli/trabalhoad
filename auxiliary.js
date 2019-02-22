var chi_calculates = require('inv-chisquare-cdf');


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
function Evento(id_pessoa, tempo_evento, tipo_evento){
    this.pessoa = id_pessoa;
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
function Pessoa( tempoDeChegada, rodada, mi ){
    this.tempoDeChegada = tempoDeChegada;
    this.rodada         = rodada;
    this.tempoServico   = gerador.exponential( mi );
    this.tempoDeChegadaEmServico;
    this.tempoDeSaida;
}

function Metricas( numRodadas, pesRodada){
    //matriz com amostra de cada metrica/rodada
    for(var i=0; i<numRodadas+1; i++){
        this.x[i] = new Array(numRodadas + 1);
        this.w[i] = new Array(numRodadas + 1);
        this.nq[i] = new Array(numRodadas + 1);
        this.n[i] = new Array(numRodadas + 1);
        this.t[i] = new Array(numRodadas + 1);
    }

    //lista com esperanca de cada metrica/rodada
    this.x_medRodadas = new Array(numRodadas + 1).fill(0);
    this.w_medRodadas = new Array(numRodadas + 1).fill(0);
    this.nq_medRodadas = new Array(numRodadas + 1).fill(0);
    this.n_medRodadas = new Array(numRodadas + 1).fill(0);
    this.t_medRodadas = new Array(numRodadas + 1).fill(0);

    //media de todas as rodadas pra cada metrica
    this.x_medTotal = 0;
    this.w_medTotal = 0;
    this.nq_medTotal = 0;
    this.n_medTotal = 0;
    this.t_medTotal = 0;

    //variancia das metricas/rodada, usando (amostraROdada - mediaRodada)/(totalAmostras -1)
    this.var_w_mediaRodadas = new Array(numRodadas + 1).fill(0);

    //media total das variancias
    this.var_w_mediaTotal = 0;

    //variancia da media das metricas, usando (mediaRodada - mediaTotal)/(totalRodadas -1)
    this.var_x = 0;
    this.var_w = 0;
    this.var_nq = 0;
    this.var_n = 0;
    this.var_t = 0;
    this.var_w_media = 0;

    //desvio pardao
    this.dp_x = 0;
    this.dp_w = 0;
    this.dp_nq = 0;
    this.dp_n = 0;
    this.dp_t = 0;
    this.dp_w_media = 0;

    //intervalo de confianca
    this.ic_x = 0;
    this.ic_w = 0;
    this.ic_nq = 0;
    this.ic_n = 0;
    this.ic_t = 0;
    this.ic_w_media = 0;

    //precisao ic
    this.prec_x = 0;
    this.prec_w = 0;
    this.prec_nq = 0;
    this.prec_n = 0;
    this.prec_t = 0;
    this.prec_w_media = 0;

    //ic usando chi-quadrado
    this.chi_inferior = 0;
    this.chi_superior = 0;
    this.w_chi_inferior = 0;
    this.w_chi_superior = 0;
    this.precisao_chi = 0;

    this.pesRodada = pesRodada;
    this.numRodadas = numRodadas;

    //acumula os tmepos de servico
    this.acumulax = function(x, rodada){
        this.x[rodada].append(x);
    }
    //acumula num pessoas na fila de espera
    this.acumulanq = function(nq, rodada){
        this.nq[rodada].append(nq);
    }
    //acumula tempo espera na fila
    this.acumulaw = function(w, rodada){
        this.w[rodada].append(w);
    }
    //acumula num pessoas total no sistema
    this.acumulan = function(n, rodada){
        this.n[rodada].append(n);
    }
    //acumula tempo total no sistema
    this.acumulat = function(t, rodada){
        this.t[rodada].append(t);
    }  
    
    //calcula valores das esperancas
    this.calculaEsp = function(){
        var sum = 0;
        for(var i = 0; i<numRodadas+1; i++){
            //calcula esperanca das metricas
            if(this.w[i].length > 0){
                sum = this.x[i].reduce(function(a, b){ return a+ b;}, 0);
                this.x_medRodadas[i] = sum/this.w[i].length;
                sum = this.w[i].reduce(function(a, b){ return a+ b;}, 0);
                this.w_medRodadas[i] = sum/this.w[i].length;
                sum = this.nq[i].reduce(function(a, b){ return a+ b;}, 0);
                this.nq_medRodadas[i] = sum/this.w[i].length;
                sum = this.n[i].reduce(function(a, b){ return a+ b;}, 0);
                this.n_medRodadas[i] = sum/this.w[i].length;
                sum = this.t[i].reduce(function(a, b){ return a+ b;}, 0);
                this.t_medRodadas[i] = sum/this.w[i].length;
            }
            //calcula Var[w]
            if(this.w[i].length == 1){
                this.var_w_mediaRodadas[i] = 0;
            }
            else{
                for( var amostra = 0; amostra<this.w[i].length; amostra++){
                    this.var_w_mediaRodadas[i] += (this.w[i][amostra] - this.w_medRodadas[i]) ** 2;
                }
                this.var_w_mediaRodadas /= this.w[i].length - 1; 
            }
            //acumula medias totais
            this.x_medTotal += this.x_medRodadas[i];
            this.w_medTotal += this.x_medRodadas[i];
            this.nq_medTotal += this.x_medRodadas[i];
            this.n_medTotal += this.x_medRodadas[i];
            this.t_medTotal += this.x_medRodadas[i];
            this.var_w_medTotal += this.x_medRodadas[i];
        }
        //calcula media total de cada metrica
        this.x_medTotal /= this.numRodadas;
        this.w_medTotal /= this.numRodadas;
        this.nq_medTotal /= this.numRodadas;
        this.n_medTotal /= this.numRodadas;
        this.t_medTotal /= this.numRodadas;
        this.var_w_medTotal /= this.numRodadas;
    }

    //calcula variancia das medias das rodadas
    this.calculaVar = function(){
        for(var i = 0; i<numRodadas+1; i++){
            this.var_x += (this.x_medRodadas[i] - this.x_medTotal) ** 2;
            this.var_w += (this.w_medRodadas[i] - this.w_medTotal) ** 2;
            this.var_nq += (this.nq_medRodadas[i] - this.nq_medTotal) ** 2;
            this.var_n += (this.n_medRodadas[i] - this.n_medTotal) ** 2;
            this.var_t += (this.t_medRodadas[i] - this.t_medTotal) ** 2;
            this.var_w_media += (this.var_w_medRodadas[i] - this.var_w_medTotal) ** 2;
        }
        this.var_x /= this.numRodadas - 1;
        this.var_w /= this.numRodadas - 1;
        this.var_nq /= this.numRodadas - 1;
        this.var_n /= this.numRodadas - 1;
        this.var_t /= this.numRodadas - 1;
        this.var_w_media /= this.numRodadas - 1;
    }

    //calcula os descios padroes
    this.calculaDp = function(){
        this.dp_x = Math.sqrt(this.var_x);
        this.dp_w = Math.sqrt(this.var_w);
        this.dp_nq = Math.sqrt(this.var_nq);
        this.dp_n = Math.sqrt(this.var_n);
        this.dp_t = Math.sqrt(this.var_t);
        this.dp_w_media = Math.sqrt(this.var_w_media);
    }

    //calcula ic das metricas
    this.calculaIc = function(){
        if(this.numRodadas > 1){
            this.calculaVar();
            this.calculaDp();
            var raiz_numRodadas = Math.sqrt(this.numRodadas);
            var t_student = 1.96  //ic de 95%

            //calcula o ic de cada metrica com t-student
            this.ic_x = t_student * this.dp_x / raiz_numRodadas;
            this.ic_w = t_student * this.dp_w / raiz_numRodadas;
            this.ic_nq = t_student * this.dp_nq / raiz_numRodadas;
            this.ic_n = t_student * this.dp_n / raiz_numRodadas;
            this.ic_t = t_student * this.dp_t / raiz_numRodadas;
            this.ic_w_media = t_student * this.dp_w_media / raiz_numRodadas;

            //calcula precisao de cada metrica
            this.x_medTotal == 0 ? this.prec_x = 0 : Math.round((this.ic_x / this.x_medTotal) * 100, 2);
            this.w_medTotal == 0 ? this.prec_w = 0 : Math.round((this.ic_w / this.w_medTotal) * 100, 2);
            this.nq_medTotal == 0 ? this.prec_nq = 0 : Math.round((this.ic_nq / this.nq_medTotal) * 100, 2);
            this.n_medTotal == 0 ? this.prec_n = 0 : Math.round((this.ic_n / this.n_medTotal) * 100, 2);
            this.t_medTotal == 0 ? this.prec_t = 0 : Math.round((this.ic_t / this.t_medTotal) * 100, 2);
            this.var_w_medTotal == 0 ? this.prec_w_media = 0 : Math.round((this.ic_w_media / this.var_w_medTotal) * 100, 2);

            //calcula ic de V[w] usando chi-quadrado
            //usa como variancia a media da variancia de todas as rodadas, e n como numero de rodadas
            var alpha = 0.05;

            //calcula a inversa da cdf para limites inferior e superior
            this.chi_inferior =  chi_calculates.invChiSquareCDF(1 - alpha/2, this.numRodadas -1);
            this.chi_superior =  chi_calculates.invChiSquareCDF(alpha/2, this.numRodadas -1);

            this.w_chi_inferior = (this.numRodadas - 1) * this.var_w_mediaTotal / this.chi_inferior;
            this.w_chi_superior = (this.numRodadas - 1) * this.var_w_mediaTotal / this.chi_superior;

            this.precisao_chi = Math.round(((this.chi_inferior - this.chi_superior)/(this.chi_inferior + this.chi_superior)) * 100, 2);
         }
    }
}

/*
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
} */