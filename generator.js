function simulacaoCompleta( seed = null /* Se null, usa Date.getTime() */ ){
    var disciplina = $("#discipline").val();
    var taxa_de_utilizacao = $("#taxaUtilizacao").val();
    
    //Usamos o mesmo gerador durante todo o tempo
    var gerador = new geradorAleatorio( seed );
    for( var i = 0 ; i < 1 ; i ++){
        iniciaFila( taxa_de_utilizacao , disciplina , gerador );
    }

}

function iniciaFila( taxa_de_utilizacao , disciplina_de_atendimento , gerador ){
    const   lambda = 0.20               // TO-DO: usar formula pra pegar lambda
    const   mi = 1.0;                   // Constante 1 pelo enunciado
    const   numeroMinimoDeColetas = 15 // Falta calcular aí, não sei se pode ser arbitrário ou w/e, ler slide de IC kkkkk    
    const   numeroTotalRodadas = 3200
    var     fila = new Fila( disciplina_de_atendimento )
    
    // Variáveis de controle:
    var     rodadaAtual = -1            // Ao término da fase transiente, muda para 0
    var     entrantesPosTransiente = 0  // Quantos entraram pós fase transiente
    var     saintesPosTransiente = 0    // Quantos sairam pós fase transiente
    var     emFaseTransiente = true     //Inicialmente em fase transiente
    var     tempoFimTransiente
    var     coletasEmFaseTransiente = []    //Usaremos no critério de fim da fase transiente
    var     varianciaFaseTransiente = null  //Usaremos no critério de fim da fase transiente
    var     rodadasTransientes = 1          //Usaremos no critério de fim da fase transiente
    var     coletasPorRodada = []       //Numero de entradas em cada rodada, inicialmente tudo 0.
    var     proximaChegada = gerador.exponential( lambda )   // Agendamos a primeira chegada
    var     proximaSaida = proximaChegada + gerador.exponential( mi )  // Já podemos agendar a primeira saida
    var     eventoAtual = proximaChegada        // Momento do proximo evento. Inicialmente será o momento da proxima chegada

    // Variáveis coletadas      
    var     pessoasPorRodada = []       // É um vetor de pessoas para cada rodada. Cada pessoa tem os dados que usaremos no fim.
    var     tempoPorRodada = []         // Duracao de cada rodada
    var     tempoOciosoPorRodada = [] 
    var     areaTotalPorRodada = []          // Area do grafico (pessoas x tempo), separado por rodadas
    var     areaEsperaPorRodada = []          // Area do grafico (pessoas x tempo), separado por rodadas
    
    // Inicializa variaveis iniciais (vazias)
    for( i = 0 ; i < numeroTotalRodadas ; i++ ){
        coletasPorRodada[i] = 0;
        pessoasPorRodada[i] = []
        tempoPorRodada[i] = 0;
        tempoOciosoPorRodada[i] = 0;
        areaTotalPorRodada[i]    = 0;
        areaEsperaPorRodada[i]    = 0;
    }

    //Primeira chegada
    fila.push( new Pessoa( proximaChegada , -1 /*Rodada inexistente, pois ainda é fase transiente*/ ) );
    //document.writeln("Entrada: " + proximaChegada + "<br>" )
    proximaChegada = proximaChegada + gerador.exponential( lambda ); // Já agendamos a segunda chegada

    //------------------------------- INICIO DA SIMULACAO ------------------------------------
    while ( 
        rodadaAtual < numeroTotalRodadas || // Continuar enquanto rodadaAtual não for suficiente
        saintesPosTransiente < entrantesPosTransiente // Garante que todos que entraram e foram contabilizados na entrada saiam
    )
    {
        // Como eventoAtual vai ser atualizado, guardamos eventoAnterior pra auxiliar no calculo da area do grafico
        var eventoAnterior = eventoAtual ;

        //Caso proximo evento seja de entrada:
        if( proximaChegada < proximaSaida ){
            eventoAtual = proximaChegada;
            var pessoaEntrante = new Pessoa( proximaChegada , rodadaAtual ) 
            fila.push( pessoaEntrante );
            proximaChegada = proximaChegada + gerador.exponential( lambda );
            
            //Se é a única pessoa na fila, entra logo em serviço
            if( fila.array.length == 1 ){
                pessoaEntrante.tempoDeChegadaEmServico = eventoAtual
            }

            //Se não esta em fase transiente, contabiliza entrante e atualizamos area:
            if( !emFaseTransiente && rodadaAtual < numeroTotalRodadas ){
                entrantesPosTransiente++;
                coletasPorRodada[rodadaAtual]++;
                areaTotalPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length - 1 /*Numero de pessoas antes dessa chegada*/ );
                //Se tinha pessoas na fila antes da chegada, atualiza área de espera
                if( fila.array.length > 2 ){
                    areaEsperaPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length - 2 /*Numero de pessoas na fila antes dessa chegada*/ );
                }
                //Se é a unica pessoa atualmente no sistema, contabilizamos o periodo ocioso que esta finalizou
                else if( fila.array.length == 1 ){
                    tempoOciosoPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior);
                }
                
                //Checa se fim da rodada, pra guardar duração desta.
                if( coletasPorRodada[rodadaAtual] >= numeroMinimoDeColetas ){
                    
                    var inicioRodadaAtual = tempoFimTransiente
                    for( i = 0 ; i < rodadaAtual ; i++ ){
                        inicioRodadaAtual += tempoPorRodada[i]
                    }
                    tempoPorRodada[rodadaAtual] = eventoAtual - inicioRodadaAtual
                    
                    rodadaAtual++
                } 
            }
        }

        //Caso proximo evento seja de saida:
        else {
            eventoAtual = proximaSaida;
            //document.writeln("Saida: " + eventoAtual + "<br>" )
            var pessoaSainte = fila.pop();
            pessoaSainte.tempoDeSaida = eventoAtual;
            
            //Se a fila passou a ficar vazia, proxima saida depende da proxima chegada
            if( fila.vazia() ){
                proximaSaida = proximaChegada + gerador.exponential( mi );
            }
            //Se a fila continua com gente, proxima saida depende do instante dessa ultima saida
            //Tambem aproveitamos para setar o tempo de chegada em servico da proxima pessoa
            else{
                proximaSaida = proximaSaida + gerador.exponential( mi );
                fila.array[0].tempoDeChegadaEmServico = eventoAtual;
            }
            
            //Se a fila está em fase transiente, analisamos se já podemos encerrar a fase:
            if( emFaseTransiente ){
                coletasEmFaseTransiente.push( pessoaSainte )
                //Se já finalizamos uma "rodada" transiente com K_min de coletas, avaliamos sua variancia
                if( coletasEmFaseTransiente.length >= numeroMinimoDeColetas ){
                    var _variancia = varianciaTempoEmEspera( coletasEmFaseTransiente )
                    
                    //Caso seja a primeira rodada transiente, ou a variância foi maior do que a última
                    //rodada transiente, começamos outra rodada transiente
                    if( rodadasTransientes <= 1 || varianciaFaseTransiente == null || _variancia >= varianciaFaseTransiente ){
                        varianciaFaseTransiente = _variancia
                        coletasEmFaseTransiente = []
                        rodadasTransientes ++
                    }
                    //Caso a variancia da rodada transiente atual diminuiu em relação a anterior,
                    //consideramos a fase transiente finalizada
                    else{
                        emFaseTransiente = false
                        tempoFimTransiente = eventoAtual
                        rodadaAtual = 0
                    }
                }
            }

            //Se a pessoa entrou pós fase transiente, contabiliza na coleta da rodada dela 
            else if( pessoaSainte.rodada >= 0 &&  pessoaSainte.rodada < numeroTotalRodadas ){
                pessoasPorRodada[ pessoaSainte.rodada ].push( pessoaSainte )
                areaTotalPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length + 1 /*Numero de pessoas antes dessa saida*/ )
                //Se tinha pessoas na fila antes da saida, atualiza área de espera
                if( fila.array.length > 0 ){
                    areaEsperaPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length /*Numero de pessoas na fila antes dessa chegada*/ );
                }
                saintesPosTransiente++
            }

        }

    }
    //------------------------------------- FIM DA SIMULACAO ---------------------------------------
    console.log( pessoasPorRodada )
    

    //  Alguns resultados que queremos da simulacao
    var     tempoEsperaPorRodada = [];
    var     mediaTempoEspera;
    var     varianciaTempoEspera;
    var     numeroTotalPorRodada = [];
    var     mediaNumeroMedio;
    var     varianciaNumeroMedio;
    var     taxaDeUtilizacaoPorRodada = [];

    var tempoEsperaPorRodadaData = {
        labels: Array.apply(null, {length: numeroTotalRodadas+1}).map(Number.call, Number),
        datasets: [{
            // backgroundColor: window.chartColors.red,
            borderWidth: 1,
            lineTension: 0,
            radius: 0,
            data: []
        }]
    };
    var numeroTotalPorRodadaData = {
        labels: Array.apply(null, {length: numeroTotalRodadas+1}).map(Number.call, Number),
        datasets: [{
            // backgroundColor: window.chartColors.red,
            borderWidth: 1,
            lineTension: 0,
            radius: 0,
            data: []
        }]
    };
    var taxaDeUtilizacaoPorRodadaData = {
        labels: Array.apply(null, {length: numeroTotalRodadas+1}).map(Number.call, Number),
        datasets: [{
            // backgroundColor: window.chartColors.blue,
            borderWidth: 1,
            lineTension: 0,
            radius: 0,
            data: []
        }]
    };

    for( r = 0 ; r < numeroTotalRodadas ; r++ ){
        // Calculo do tempo medio por rodada, passando como parametro o array de pessoas da rodada
        tempoEsperaPorRodada[r] = mediaTempoEmEspera( pessoasPorRodada[r] )

        //Calculo do numero medio de pessoas por rodada
        numeroTotalPorRodada[r] = areaTotalPorRodada[r] / tempoPorRodada[r]

        //Calculo da taxa de utilizacao por rodada:
        taxaDeUtilizacaoPorRodada[r] = (tempoPorRodada[r] - tempoOciosoPorRodada[r]) / tempoPorRodada[r]
    }

    // Media dos tempos medios de todas as rodadas
    mediaTempoEspera = media( tempoEsperaPorRodada )
    // Variancia dos tempos medios de todas rodadas
    varianciaTempoEspera = variancia( tempoEsperaPorRodada ) 

    // Media do numero medio de pessoas por rodada
    mediaNumeroMedio = media(numeroTotalPorRodada)
    // Variancia do numero medio de pessoas por rodada
    varianciaNumeroMedio = variancia( numeroTotalPorRodada )


    //Printando tabelas de cada rodada e passando informacoes pra pltar o grafico
    for( r = 0 ; r < numeroTotalRodadas ; r++ ){
        
        //$("#data").append("<h2>Rodada "+ r + "</h2>");
        //var tabelaRodada = "<table border='1'>";
        //tabelaRodada+="<tr><td>Tempo Médio no sistema</td><td>"+tempoEsperaPorRodada[r]+"</td></tr>";
        //tabelaRodada+="<tr><td>Número Médio de Pessoas</td><td>"+numeroTotalPorRodada[r]+"</td></tr>";
        //tabelaRodada+="<tr><td>Taxa de Utilização</td><td>"+taxaDeUtilizacaoPorRodada[r]+"</td></tr>";
        //tabelaRodada += "</table><br><br><br>";
        //$("#data").append(tabelaRodada);
        
        //Grafico
        addDataToGraph({y : taxaDeUtilizacaoPorRodada[r],x : r}, taxaDeUtilizacaoPorRodadaData);
        addDataToGraph({y : tempoEsperaPorRodada[r], x : r}, tempoEsperaPorRodadaData);
        addDataToGraph({y : numeroTotalPorRodada[r],x : r}, numeroTotalPorRodadaData);
    }


    var icmtemp = IC_tStudent( mediaTempoEspera , varianciaTempoEspera , numeroTotalRodadas);
    var icmnum = ICmedia( mediaNumeroMedio , varianciaNumeroMedio , numeroTotalRodadas );
    
    //var icvtemp = ICvariancia(summtemp/numeroTotalRodadas, numeroTotalRodadas, sumvtemp/(numeroTotalRodadas-1))
    //var icvnum = ICvariancia(summtemp/numeroTotalRodadas, numeroTotalRodadas, sumvtemp/(numeroTotalRodadas-1));
    //addIC(window.tempoEsperaPorRodadaChart, icmtemp[0], icmtemp[1]);
    //addIC(window.numeroTotalPorRodadaChart, icmnum[0], icmnum[1]);
    //console.log(icmtemp[0], icmtemp[1])
    
    //plotgraphs(tempoEsperaPorRodadaData, numeroTotalPorRodadaData, taxaDeUtilizacaoPorRodadaData, icmtemp, icmnum);

    //$("#data").append("<h3>Rodadas transientes:<br>"+ rodadasTransientes + "</h3>");
    //$("#data").append("<h3>Media do tempo em espera:<br>"+ mediaTempoEspera + "</h3>");
    //$("#data").append("<h3>Variancia do tempo de espera:<br>"+ varianciaTempoEspera + "</h3>");
    //$("#data").append("<h3>Media do numero de pessoas em fila:<br>"+ mediaNumeroMedio + "</h3>");
    //$("#data").append("<h3>Variancia do numero de pessoas em fila:<br>"+ varianciaNumeroMedio + "</h3>");
    
    $("#data").append("<h3>IC do tempo medio de espera:<br>"+ icmtemp[0] + " -- " + icmtemp[1] + "<br>(precisao de "+100*precisaoIC(icmtemp)+"% ) <br>" + "</h3>");
    $("#data").append("<h3>IC do número medio:<br>"+ icmnum[0] + " -- " + icmnum[1] + "<br>(precisao de "+100*precisaoIC(icmnum)+"% ) <br>" + "</h3>");
    
    $("#data").append("<br><br><br><br>");

    return

}

