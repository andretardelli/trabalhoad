
function simulacaoCompleta( seed = null /* Se null, usa Date.getTime() */ ){
    //var     disciplinas = [ "FCFS" , "LCFS" ]
    //var     taxas_de_utilizacao = [ 0.2 , 0.4 , 0.6 , 0.8 , 0.9 ]
    var     disciplinas = [ "FCFS" ]
    var     taxas_de_utilizacao = [ 0.9 ]
    
    //Usamos o mesmo gerador para todas as filas
    var gerador = new geradorAleatorio( seed );

    for( var d in disciplinas ){
        for( var t in taxas_de_utilizacao ){
            iniciaFila( taxas_de_utilizacao[t] , disciplinas[d] , gerador );
        }
    }

}

function iniciaFila( taxa_de_utilizacao , disciplina_de_atendimento , gerador ){
    const   lambda = 0.9;               // TO-DO: usar formula pra pegar lambda
    const   mi = 1;                     // Constante 1 pelo enunciado
    const   numeroMinimoDeColetas = 20 // Falta calcular aí, não sei se pode ser arbitrário ou w/e, ler slide de IC kkkkk    
    const   numeroTotalRodadas = 32
    
    var     fila = new Fila( disciplina_de_atendimento );
    var     rodadaAtual = -1            //Ao término da fase transiente, muda para 0
    var     entrantes = 0               //Contabilizaremos apenas pós fase-transiente
    var     saintes = 0                 //Controle de término
    var     coletasPorRodada = []       //Inicialmente, 0 em tudo
    var     temposDeFilaPorRodada = []  // É um vetor para cada rodada
    var     tempoFimDasRodadas = []
    var     emFaseTransiente = true
    var     tempoFimTransiente;
    var     proximaChegada = gerador.exponential( lambda ); // Agendamos a primeira chegada
    var     proximaSaida = proximaChegada + gerador.exponential( mi ); // Já podemos agendar a primeira saida

    // var     area = 0;


    fila.push( new Pessoa( proximaChegada , -1 ) );
    document.writeln("Entrada: " + proximaChegada + "<br>" )
    proximaChegada = proximaChegada + gerador.exponential( lambda ); // Já agendamos a segunda chegada

    for( i = 0 ; i < numeroTotalRodadas ; i++ ){
        coletasPorRodada[i] = 0;
        temposDeFilaPorRodada[i] = [];
    }


    //------------------------------- INICIO DA SIMULACAO ------------------------------------
    while ( 
        rodadaAtual < numeroTotalRodadas ||         // Continuar enquanto rodadaAtual não for suficiente
        saintes < entrantes // Garante que todos que entraram e foram contabilizados na entrada saiam
    )
    {
        var eventoAtual // Momento do proximo evento (sera de chegada ou saida)

        //Caso proximo evento seja de saida:
        if( proximaSaida < proximaChegada ){
            eventoAtual = proximaSaida;
            document.writeln("Saida: " + eventoAtual + "<br>" )
            var pessoaSainte = fila.pop();
            
            //Se a fila passou a ficar vazia, proxima saida depende da proxima chegada
            if( fila.vazia() ){
                proximaSaida = proximaChegada + gerador.exponential( mi );
            }
            //Se a fila continua com gente, proxima saida depende do instante dessa ultima saida    
            else{
                proximaSaida = proximaSaida + gerador.exponential( mi );
            }
            
            //Se pós-transiente, contabiliza o tempo que a pessoa sainte ficou no sistema
            if( pessoaSainte.rodada >= 0 &&  pessoaSainte.rodada < numeroTotalRodadas ){
                ( temposDeFilaPorRodada[pessoaSainte.rodada] ).push( eventoAtual - pessoaSainte.tempoDeChegada )
                saintes++
            }

            // area += quantidadePessoas * (simulationTime - lastEventTime);
        }
        
        //Caso proximo evento seja de entrada:
        else
        {
            eventoAtual = proximaChegada;
            document.writeln("Entrada: " + eventoAtual + "<br>" )
            fila.push( new Pessoa( proximaChegada , rodadaAtual ) );
            proximaChegada = proximaChegada + gerador.exponential( lambda );
            //Se não esta em fase transiente, contabiliza pra rodada:
            if( !emFaseTransiente && rodadaAtual < numeroTotalRodadas ){
                entrantes++;
                coletasPorRodada[rodadaAtual]++;
                //Checa se fim da rodada
                if( coletasPorRodada[rodadaAtual] >= numeroMinimoDeColetas ){
                    tempoFimDasRodadas[rodadaAtual] = eventoAtual;
                    rodadaAtual++;
                } 
            }
        }

        // Checa se está em fase transiente e, se estiver, se já pode considerar acabada
        if( emFaseTransiente ){
            // Fazer o calculo da taxa de utilizacao recente...
            if( gerador.randi()%10 == 0 ){ 
                document.writeln("<br>")
                document.writeln("...........Fim da fase transiente......................<br>") 
                document.writeln("<br>")
                emFaseTransiente = false;
                rodadaAtual = 0;
            }
        }

        // mediaPessoasPorRodada.push(area/tempoTotalSimulacao);
    }
    //------------------------------------- FIM DA SIMULACAO ---------------------------------------


    //Calculo das estatisticas:
    
    //Duracao de cada rodada
    var     duracaoRodadas = [];
    duracaoRodadas[0] = tempoFimDasRodadas[0] - tempoFimTransiente;
    for( i = 1 ; i < numeroTotalRodadas ; i++ ){
        duracaoRodadas[i] = tempoFimDasRodadas[i] - tempoFimDasRodadas[i-1];  
    }

    // Tempo medio de cada pessoa por rodada
    var     tempoMedioPorRodada = [];
    for( i = 0 ; i < numeroTotalRodadas ; i++ ){
        // tempoMedio[i] =    
    }    
    

    // //Numero medio de pessoas no sistema
    // for(var i = 0; i < mediaPessoasPorRodada.length; i++)
    // {
    //     mediaPessoasNoSistema += (mediaPessoasPorRodada[i])/numeroTotalRodadas;
    // }


}
