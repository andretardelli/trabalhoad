
function simulacaoCompleta( seed = null /* Se null, usa Date.getTime() */ ){
    //var     disciplinas = [ "FCFS" , "LCFS" ]
    //var     taxas_de_utilizacao = [ 0.2 , 0.4 , 0.6 , 0.8 , 0.9 ]
    var     disciplinas = [ "FCFS" ]
    var     taxas_de_utilizacao = [ 0.9 ]
    
    //Usamos o mesmo gerador para todas as filas
    var gerador = new geradorAleatorio( seed )

    for( var d in disciplinas ){
        for( var t in taxas_de_utilizacao ){
            iniciaFila( taxas_de_utilizacao[t] , disciplinas[d] , gerador )
        }
    }

}

function iniciaFila( taxa_de_utilizacao , disciplina_de_atendimento , gerador ){
    const   lambda = 0.9               // TO-DO: usar formula pra pegar lambda
    const   mi = 1                     // Constante 1 pelo enunciado
    const   numeroMinimoDeColetas = 50 // Falta calcular aí, não sei se pode ser arbitrário ou w/e, ler slide de IC kkkkk    
    const   numeroTotalRodadas = 32
    var     fila = new Fila( disciplina_de_atendimento )
    
    // Variáveis de controle:
    var     rodadaAtual = -1            // Ao término da fase transiente, muda para 0
    var     entrantesPosTransiente = 0  // Quantos entraram pós fase transiente
    var     saintesPosTransiente = 0    // Quantos sairam pós fase transiente
    var     emFaseTransiente = true     //Inicialmente em fase transiente
    var     coletasPorRodada = []       //Numero de entradas em cada rodada, inicialmente tudo 0.
    var     proximaChegada = gerador.exponential( lambda )   // Agendamos a primeira chegada
    var     proximaSaida = proximaChegada + gerador.exponential( mi )  // Já podemos agendar a primeira saida
    var     eventoAtual = proximaChegada        // Momento do proximo evento. Inicialmente será o momento da proxima chegada

    // Variáveis coletadas      
    var     pessoasPorRodada = []       // É um vetor de pessoas para cada rodada. Cada pessoa tem os dados que usaremos no fim.
    var     duracaoRodadas = []         // Duracao de cada rodada
    var     tempoOciosoPorRodada = [] 
    var     areaPorRodada = []          // Area do grafico (pessoas x tempo), separado por rodadas
    var     tempoFimTransiente
    
    // Inicializa variaveis iniciais (vazias)
    for( i = 0 ; i < numeroTotalRodadas ; i++ ){
        coletasPorRodada[i] = 0;
        pessoasPorRodada[i] = []
        duracaoRodadas[i] = 0;
        tempoOciosoPorRodada[i] = 0;
        areaPorRodada[i]    = 0;
    }

    //Primeira chegada
    fila.push( new Pessoa( proximaChegada , -1 /*Rodada inexistente, pois ainda é fase transiente*/ ) )
    //document.writeln("Entrada: " + proximaChegada + "<br>" )
    proximaChegada = proximaChegada + gerador.exponential( lambda ) // Já agendamos a segunda chegada

    //------------------------------- INICIO DA SIMULACAO ------------------------------------
    while ( 
        rodadaAtual < numeroTotalRodadas || // Continuar enquanto rodadaAtual não for suficiente
        saintesPosTransiente < entrantesPosTransiente // Garante que todos que entraram e foram contabilizados na entrada saiam
    )
    {
        // Como eventoAtual vai ser atualizado, guardamos eventoAnterior pra auxiliar no calculo da area do grafico
        var eventoAnterior = eventoAtual 

        //Caso proximo evento seja de entrada:
        if( proximaChegada < proximaSaida ){
            eventoAtual = proximaChegada
            //document.writeln("Entrada: " + eventoAtual + "<br>" )
            fila.push( new Pessoa( proximaChegada , rodadaAtual ) )
            proximaChegada = proximaChegada + gerador.exponential( lambda )
            //Se não esta em fase transiente, contabiliza entrante e atualizamos area:
            if( !emFaseTransiente && rodadaAtual < numeroTotalRodadas ){
                entrantesPosTransiente++
                coletasPorRodada[rodadaAtual]++
                areaPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length - 1 /*Numero de pessoas antes dessa chegada*/ )
                //Se é a unica pessoa atualmente no sistema, contabilizamos o periodo ocioso que esta finalizou
                if( fila.array.length == 1 ){
                    tempoOciosoPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)
                }
                //Checa se fim da rodada, pra guardar duração desta.
                if( coletasPorRodada[rodadaAtual] >= numeroMinimoDeColetas ){
                    if( rodadaAtual > 0 ){
                        var inicioRodadaAtual = tempoFimTransiente
                        for( i = 0 ; i < rodadaAtual ; i++ ){
                            inicioRodadaAtual += duracaoRodadas[i]
                        }
                        duracaoRodadas[rodadaAtual] = eventoAtual - inicioRodadaAtual
                    }
                    else{
                        duracaoRodadas[rodadaAtual] = eventoAtual - tempoFimTransiente
                    }
                    rodadaAtual++
                } 
            }
        }

        //Caso proximo evento seja de saida:
        else {
            eventoAtual = proximaSaida
            //document.writeln("Saida: " + eventoAtual + "<br>" )
            var pessoaSainte = fila.pop()
            pessoaSainte.tempoDeSaida = eventoAtual
            
            //Se a fila passou a ficar vazia, proxima saida depende da proxima chegada
            if( fila.vazia() ){
                proximaSaida = proximaChegada + gerador.exponential( mi )
            }
            //Se a fila continua com gente, proxima saida depende do instante dessa ultima saida
            //Tambem aproveitamos para setar o tempo de chegada em servico da proxima pessoa
            else{
                proximaSaida = proximaSaida + gerador.exponential( mi )
                fila.array[0].tempoDeChegadaEmServico = eventoAtual
            }
            
            //Se a pessoa entrou pós fase transiente, contabiliza
            if( pessoaSainte.rodada >= 0 &&  pessoaSainte.rodada < numeroTotalRodadas ){
                pessoasPorRodada[ pessoaSainte.rodada ].push( pessoaSainte )
                areaPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length + 1 /*Numero de pessoas antes dessa saida*/ )
                saintesPosTransiente++
            }
        }
        
        // Checa se está em fase transiente e, se estiver, se já pode considerar acabada
        if( emFaseTransiente ){
            // Fazer o calculo da taxa de utilizacao recente...
            if( gerador.randi()%10 == 0 ){ 
                //document.writeln("<br>")
                //document.writeln("...........Fim da fase transiente......................<br>") 
                //document.writeln("<br>")
                emFaseTransiente = false
                tempoFimTransiente = eventoAtual
                rodadaAtual = 0
            }
        }

        // mediaPessoasPorRodada.push(area/tempoTotalSimulacao)
    }
    //------------------------------------- FIM DA SIMULACAO ---------------------------------------


    //  Resultados que queremos da simulacao
    var     tempoMedioPorRodada = []
    var     numeroMedioPorRodada = []
    var     taxaDeUtilizacaoPorRodada = []

    // Calculo das variaveis estatisticas
    for( r = 0 ; r < numeroTotalRodadas ; r++ ){
        
        // Calculo do tempo medio por rodada. Media do tempo de estadia para cada pessoa
        tempoMedioPorRodada[r] = 0
        for( i in pessoasPorRodada[r] ){
            pessoa = (pessoasPorRodada[r])[i]
            tempoMedioPorRodada[r] += pessoa.tempoDeSaida - pessoa.tempoDeChegada
        }
        tempoMedioPorRodada[r] = tempoMedioPorRodada[r] / pessoasPorRodada[r].length 
        document.write( "tempoMedio(rodada " + r + "):.........." + tempoMedioPorRodada[r] + "<br>")

        //Calculo do numero medio de pessoas por rodada
        numeroMedioPorRodada[r] = areaPorRodada[r] / pessoasPorRodada[r].length
        document.write( "numeroMedio(rodada " + r + "):........." + numeroMedioPorRodada[r] + "<br>")

        //Calculo da taxa de utilizacao por rodada:
        taxaDeUtilizacaoPorRodada[r] = (duracaoRodadas[r] - tempoOciosoPorRodada[r]) / duracaoRodadas[r]
        document.write( "taxaDeUtilizacao(rodada " + r + "):...." + taxaDeUtilizacaoPorRodada[r] + "<br>")

        document.write( "duracaoRodada(rodada " + r + "):......." + duracaoRodadas[r] + "<br>")
        document.write( "tempoOcioso(rodada " + r + "):.........." + tempoOciosoPorRodada[r] + "<br>")
        document.write( "<br><br><br>")

    }    

}
