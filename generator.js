function simulacaoCompleta( ){
    var disciplina = $("#discipline").val();
    var taxa_de_utilizacao = $("#taxaUtilizacao").val();
    var k_min =  parseInt($("#kmin").val())

    if( $("#taxaUtilizacao").val() == "" || $("#mu").val() == "" || $("#kmin").val() == "" ){
        alert("Preencha todos os campos antes de executar o simulador! (Com exceção da seed, que será gerada uma internamente caso não especificada)");
        return 0;
    }else if($("#kmin").val() == 0){
        alert("kmin precisa ser maior do que zero!");
        return 0;
    }

    //Usamos o mesmo gerador durante todo o tempo
    var gerador = new geradorAleatorio( $("#seed").val() )
        for( var i = 0 ; i < 1 ; i ++){
        iniciaFila( taxa_de_utilizacao , disciplina , k_min , gerador );
    }

}

function iniciaFila( taxa_de_utilizacao , disciplina_de_atendimento , k_min , gerador ){
    const   lambda = $("#taxaUtilizacao").val();               // TO-DO: usar formula pra pegar lambda
    const   mi = 1.0;                   // Constante 1 pelo enunciado
    const   numeroMinimoDeColetas = k_min; // Falta calcular aí, não sei se pode ser arbitrário ou w/e, ler slide de IC kkkkk    
    const   numeroTotalRodadas = 3200;
    var     fila = new Fila( disciplina_de_atendimento )
    var     tempoInicioSimulacao = (new Date()).getMilliseconds()
    
    

    // Variáveis de controle:
    var     rodadaAtual = -1;            // Ao término da fase transiente, muda para 0
    var     entrantesPosTransiente = 0;  // Quantos entraram pós fase transiente
    var     saintesPosTransiente = 0;    // Quantos sairam pós fase transiente
    var     emFaseTransiente = true;     //Inicialmente em fase transiente
    var     tempoFimTransiente;
    var     coletasEmFaseTransiente = [];    //Usaremos no critério de fim da fase transiente
    var     ultimaVarianciaTransiente = null;  //Usaremos no critério de fim da fase transiente
    var     quedasVarianciaTransiente = 0;   //Usaremos no critério de fim da fase transiente
    var     rodadasTransientes = 1;          //Usaremos no critério de fim da fase transiente
    var     coletasPorRodada = [];       //Numero de entradas em cada rodada, inicialmente tudo 0.
    var     proximaChegada = gerador.exponential( lambda );   // Agendamos a primeira chegada
    var     proximaSaida = proximaChegada + gerador.exponential( mi );  // Já podemos agendar a primeira saida
    var     eventoAtual = proximaChegada;        // Momento do proximo evento. Inicialmente será o momento da proxima chegada

    // Variáveis coletadas      
    var     pessoasPorRodada = [];       // É um vetor de pessoas para cada rodada. Cada pessoa tem os dados que usaremos no fim.
    var     temposDeRodada = [];         // Duracao de cada rodada
    var     temposOciososDeRodada = []; 
    var     areaTotalPorRodada = [];          // Area do grafico (pessoas x tempo), separado por rodadas
    var     areaEsperaPorRodada = [];          // Area do grafico (pessoas x tempo), separado por rodadas
    
    // Inicializa variaveis iniciais (vazias)
    for( i = 0 ; i < numeroTotalRodadas ; i++ ){
        coletasPorRodada[i] = 0;
        pessoasPorRodada[i] = [];
        temposDeRodada[i] = 0;
        temposOciososDeRodada[i] = 0;
        areaTotalPorRodada[i]    = 0;
        areaEsperaPorRodada[i]    = 0;
    }

    //Primeira chegada
    var primeiraPessoa = new Pessoa( proximaChegada , -1 /*Rodada inexistente, pois ainda é fase transiente*/ ) 
    primeiraPessoa.tempoDeChegadaEmServico = 0
    fila.push( primeiraPessoa );
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
            var pessoaEntrante = new Pessoa( eventoAtual , rodadaAtual ); 
            fila.push( pessoaEntrante );
            proximaChegada = proximaChegada + gerador.exponential( lambda );

            //Se é a única pessoa na fila, entra logo em serviço
            if( fila.array.length == 1 ){
                pessoaEntrante.tempoDeChegadaEmServico = eventoAtual;
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
                    temposOciososDeRodada[rodadaAtual] += (eventoAtual - eventoAnterior);
                }
                
                //Checa se fim da rodada, pra guardar duração desta.
                if( coletasPorRodada[rodadaAtual] >= numeroMinimoDeColetas ){
                    
                    var inicioRodadaAtual = tempoFimTransiente;
                    for( i = 0 ; i < rodadaAtual ; i++ ){
                        inicioRodadaAtual += temposDeRodada[i];
                    }
                    temposDeRodada[rodadaAtual] = eventoAtual - inicioRodadaAtual;
                    
                    rodadaAtual++;
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
                coletasEmFaseTransiente.push( pessoaSainte );
                //Se já finalizamos uma "rodada" transiente com K_min de coletas, avaliamos sua variancia
                if( coletasEmFaseTransiente.length >= numeroMinimoDeColetas ){
                    var _variancia = varianciaTempoEmEspera( coletasEmFaseTransiente );
                    
                    // Comparamos a variancia da rodada transiente atual com a anterior
                    // para saber se podemos contabilizar uma queda de variância
                    if(  ultimaVarianciaTransiente != null && _variancia >= ultimaVarianciaTransiente   ){
                        quedasVarianciaTransiente++       
                    }
                    
                    // Caso ainda não tenha sido alcançado o número de quedas suficiente,
                    // começamos outra rodada transiente
                    if( quedasVarianciaTransiente < numeroTotalRodadas / 2.0 ){   
                        ultimaVarianciaTransiente = _variancia;
                        coletasEmFaseTransiente = [];
                        rodadasTransientes ++
                    }
                    //Caso contrário, terminamos a fase transiente
                    else{
                        //alert("essa foi minha ultima variancia")
                        emFaseTransiente = false;
                        tempoFimTransiente = eventoAtual;
                        rodadaAtual = 0;
                    }
                }
            }

            //Se a pessoa entrou pós fase transiente, contabiliza na coleta da rodada dela 
            else if( pessoaSainte.rodada >= 0 &&  pessoaSainte.rodada < numeroTotalRodadas ){
                pessoasPorRodada[ pessoaSainte.rodada ].push( pessoaSainte );
                areaTotalPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length + 1 /*Numero de pessoas antes dessa saida*/ );
                //Se tinha pessoas na fila antes da saida, atualiza área de espera
                if( fila.array.length > 0 ){
                    areaEsperaPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length /*Numero de pessoas na fila antes dessa saida*/ );
                }
                saintesPosTransiente++;
            }

        }

    }
    //------------------------------------- FIM DA SIMULACAO ---------------------------------------
    

    //  --------- Resultados que queremos calcular das coletas --------------
    //  Tempo de espera -------------------------
    var     mediasTempoEspera = []
    var     varianciasTempoEspera = []
    var     IC_mediaTempoEspera
    var     IC_varianciaTempoEspera_tStudent
    var     IC_varianciaTempoEspera_chi2
    //  Numero de pessoas em fila ---------------
    var     mediasNumeroEmFila = []
    var     varianciasNumeroEmFila = [] // Não tem como calcular!
    var     IC_mediaNumeroEmFila
    var     IC_varianciaNumeroFila_tStudent // Não tem como calcular!
    var     IC_varianciaNumeroFila_chi2
    // Outras variaveis que podem interessar ----
    var     taxaDeUtilizacaoPorRodada = [];

    // Calculo dos resultados --------
    for( r = 0 ; r < numeroTotalRodadas ; r++ ){

        // Calculo da media e variancia do tempo de espera por rodada, passando como parametro o array de pessoas da rodada
        mediasTempoEspera[r] = mediaTempoEmEspera( pessoasPorRodada[r] );
        varianciasTempoEspera[r] = varianciaTempoEmEspera( pessoasPorRodada[r] )

        //Calculo do numero medio de pessoas por rodada
        mediasNumeroEmFila[r] = areaEsperaPorRodada[r] / temposDeRodada[r];

        //Calculo da taxa de utilizacao por rodada:
        taxaDeUtilizacaoPorRodada[r] = (temposDeRodada[r] - temposOciososDeRodada[r]) / temposDeRodada[r];
    }
    
    mediaTempoEspera        = media( mediasTempoEspera );
    IC_mediaTempoEspera                 = IC_tStudent( mediasTempoEspera );
    IC_varianciaTempoEspera_tStudent    = IC_tStudent( varianciasTempoEspera )
    IC_varianciaTempoEspera_chi2        = IC_chiSquare( mediasTempoEspera )

    mediaNumeroEmFila = media(mediasNumeroEmFila);
    IC_mediaNumeroEmFila            = IC_tStudent( mediasNumeroEmFila );
    IC_varianciaNumeroFila_tStudent = IC_tStudent( varianciasNumeroEmFila );
    IC_varianciaNumeroFila_chi2     = IC_chiSquare( mediasNumeroEmFila );


    //Passando informacoes pra plotar o grafico, se pedido
    if ($("#grafico").val() =="sim"){

        // Estruturas pra criação do gráfico
        var mediasTempoEsperaData = {
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
        var contagemTotalData = {
            labels: Array.apply(null, {length: numeroTotalRodadas+1}).map(Number.call, Number),
            datasets: [{
                // backgroundColor: window.chartColors.blue,
                borderWidth: 1,
                lineTension: 0,
                radius: 0,
                data: []
            }]
        };

        var varianciasTempoEsperaData = {
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
            //Grafico
            addDataToGraph({y : taxaDeUtilizacaoPorRodada[r],x : r}, taxaDeUtilizacaoPorRodadaData);
            addDataToGraph({y : mediasTempoEspera[r], x : r}, mediasTempoEsperaData);
            addDataToGraph({y : mediasNumeroEmFila[r],x : r}, numeroTotalPorRodadaData);   
            addDataToGraph({y : varianciasTempoEspera[r],x : r}, varianciasTempoEsperaData);   
        }

        for( r = 0 ; r < fila.contagem.length ;){ 
            addDataToGraph({y : fila.contagem[r] * r ,x : r}, contagemTotalData); 
            r  = ~~(r + fila.contagem.length/1000); //retorna o valor inteiro 
            //como são muitas pessoas, incremento o gráfico do número total de pessoas/1000
        }

           

        plotgraphs(mediasTempoEsperaData, numeroTotalPorRodadaData, taxaDeUtilizacaoPorRodadaData, contagemTotalData, varianciasTempoEsperaData, IC_mediaTempoEspera, IC_mediaNumeroEmFila);
    }

    var tempoFimDaSimulacao = (new Date()).getMilliseconds()
    //Printa tabela sobre a simulacao
    $("#data").append("<h3>Estatísticas:<br></h3>");
    var tabelaFinal = "<table class='table table-striped table-bordered'><tbody>" //<thead><tr><td colspan='2'> Estatísticas</td></tr></thead>
    tabelaFinal+= "<tr><td class='bold'>Tempo real de processamento da fila(ms):</td><td>"+ (tempoFimDaSimulacao - tempoInicioSimulacao) +"ms</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>Rodadas Transientes:</td><td>"+rodadasTransientes+"</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>Média do Tempo em Espera:</td><td>"+media(mediasTempoEspera)+"</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>Variância das medias do Tempo em Espera:</td><td>"+variancia(mediasTempoEspera)+"</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>Média das variâncias do Tempo em Espera:</td><td>"+media(varianciasTempoEspera)+"</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>IC da média do tempo de espera:</td><td>"+IC_mediaTempoEspera[0] + " -- " + IC_mediaTempoEspera[1]+ " ( Precisão de "+100*precisaoIC(IC_mediaTempoEspera)+"% )</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>IC da variância do tempo de espera(t-student):</td><td>"+IC_varianciaTempoEspera_tStudent[0] + " -- " + IC_varianciaTempoEspera_tStudent[1] + " ( Precisão de "+100*precisaoIC(IC_varianciaTempoEspera_tStudent)+"% )</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>IC da variância do tempo de espera(chi-quadrado):</td><td>"+IC_varianciaTempoEspera_chi2[0] + " -- " + IC_varianciaTempoEspera_chi2[1]+ " ( Precisão de "+100*precisaoIC(IC_varianciaTempoEspera_chi2)+"% )</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>Média do Número de Pessoas em Fila:</td><td>"+media(mediasNumeroEmFila)+"</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>IC da média do número de pessoas em fila:</td><td>"+IC_mediaNumeroEmFila[0] + " -- " + IC_mediaNumeroEmFila[1]+ " ( Precisão de "+100*precisaoIC(IC_mediaNumeroEmFila)+"% )</td></tr>";
    //tabelaFinal+= "<tr><td class='bold'>IC da variância do número de pessoas em fila(t-student):</td><td>"+IC_varianciaNumeroFila_tStudent[0] + " -- " + IC_varianciaNumeroFila_tStudent[1] + " ( Precisão de "+100*precisaoIC(IC_varianciaNumeroFila_tStudent)+"% )</td></tr>";
    tabelaFinal+= "<tr><td class='bold'>IC da variância do número de pessoas em fila(chi-quadrado):</td><td>"+IC_varianciaNumeroFila_chi2[0] + " -- " + IC_varianciaNumeroFila_chi2[1]+ " ( Precisão de "+100*precisaoIC(IC_varianciaNumeroFila_chi2)+"% )</td></tr>";
    tabelaFinal+="</tbody></table>";
    $("#data").append(tabelaFinal);
    $("#data").append("<br><br><br><br>");

    return
}

