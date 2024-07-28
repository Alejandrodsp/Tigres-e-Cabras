import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  tabuleiro: (null | 'goat' | 'tiger')[][] = [
    ['tiger', null, null, null, 'tiger'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['tiger', null, null, null, 'tiger'],
  ];
  jogador: (null | 'goat' | 'tiger') = null;
  jogadorAtual: 'goat' | 'tiger' = 'goat';
  pecaSelecionada: (null | [number, number]) = null;
  cabrasTabuleiro = 0;
  cabrasMortas = 0;
  vencedor: (null | 'goat' | 'tiger') = null;
  backgroundMusic = new Audio();
  movimentosValidos: { [key: string]: string[] } = {"0_0":["0_1","1_0","1_1"],"0_1":["0_2","0_0","1_1"],"0_2":["0_3","0_1","1_2","1_1","1_3"],"0_3":["0_4","0_2","1_3"],"0_4":["0_3","1_4","1_3"],"1_0":["1_1","2_0","0_0"],"1_1":["1_2","1_0","2_1","0_1","2_0","0_2","2_2","0_0"],"1_2":["1_3","1_1","2_2","0_2"],"1_3":["1_4","1_2","2_3","0_3","2_2","0_4","2_4","0_2"],"1_4":["1_3","2_4","0_4"],"2_0":["2_1","3_0","1_0","1_1","3_1"],"2_1":["2_2","2_0","3_1","1_1"],"2_2":["2_3","2_1","3_2","1_2","3_1","1_3","3_3","1_1"],"2_3":["2_4","2_2","3_3","1_3"],"2_4":["2_3","3_4","1_4","3_3","1_3"],"3_0":["3_1","4_0","2_0"],"3_1":["3_2","3_0","4_1","2_1","4_0","2_2","4_2","2_0"],"3_2":["3_3","3_1","4_2","2_2"],"3_3":["3_4","3_2","4_3","2_3","4_2","2_4","4_4","2_2"],"3_4":["3_3","4_4","2_4"],"4_0":["4_1","3_0","3_1"],"4_1":["4_2","4_0","3_1"],"4_2":["4_3","4_1","3_2","3_3","3_1"],"4_3":["4_4","4_2","3_3"],"4_4":["4_3","3_4","3_3"]};
  capturasValidas: { [key: string]: string[] } = {"0_0":["0_2","2_0","2_2"],"0_1":["0_3","2_1"],"0_2":["0_4","0_0","2_2","2_0","2_4"],"0_3":["0_1","2_3"],"0_4":["0_2","2_4","2_2"],"1_0":["1_2","3_0"],"1_1":["1_3","3_1","3_3"],"1_2":["1_4","1_0","3_2"],"1_3":["1_1","3_3","3_1"],"1_4":["1_2","3_4"],"2_0":["2_2","4_0","0_0","0_2","4_2"],"2_1":["2_3","4_1","0_1"],"2_2":["2_4","2_0","4_2","0_2","4_0","0_4","4_4","0_0"],"2_3":["2_1","4_3","0_3"],"2_4":["2_2","4_4","0_4","4_2","0_2"],"3_0":["3_2","1_0"],"3_1":["3_3","1_1","1_3"],"3_2":["3_4","3_0","1_2"],"3_3":["3_1","1_3","1_1"],"3_4":["3_2","1_4"],"4_0":["4_2","2_0","2_2"],"4_1":["4_3","2_1"],"4_2":["4_4","4_0","2_2","2_4","2_0"],"4_3":["4_1","2_3"],"4_4":["4_2","2_4","2_2"]};
  profundidade = 5;
  melhorMovimento: { from: [number, number], to: [number, number] } | null = null;
  
  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.backgroundMusic.src = '../assets/background-music.mp3';
    this.backgroundMusic.load();
  }
  
  novoJogo() {
    this.tabuleiro = [
      ['tiger', null, null, null, 'tiger'],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      ['tiger', null, null, null, 'tiger'],
    ];
    this.jogador = null;
    this.jogadorAtual = 'goat';
    this.pecaSelecionada = null;
    this.cabrasTabuleiro = 0;
    this.cabrasMortas = 0;
    this.vencedor = null;
    this.melhorMovimento = null;
  }

  openModalVencedor() {
    const dialogRef = this.dialog.open(DialogVencedor, {
      data: {
        vencedor: this.vencedor,
        jogador: this.jogador
      },
    });

    dialogRef.afterClosed().subscribe(jogarNovamente => {
      if (jogarNovamente) this.novoJogo();
    });
  }

  selecionarModoJogo(modo: 'goat' | 'tiger') {
    this.jogador = modo;
    this.backgroundMusic.play();
    if (this.jogadorAtual !== this.jogador) {
      this.realizarJogadaComputador();
    }
  }

  realizarJogada(rowIndex: number, colIndex: number) {
    let moveu = false;

    if (this.jogadorAtual === 'goat' && this.cabrasTabuleiro < 20) {
      if (this.tabuleiro[rowIndex][colIndex] === null) {
        this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
        this.cabrasTabuleiro++;
        moveu = true;
      }
    } else {
      if (this.tabuleiro[rowIndex][colIndex] === this.jogadorAtual) {
        this.pecaSelecionada = [rowIndex, colIndex];
      } else if (this.tabuleiro[rowIndex][colIndex] === null) {
        if (this.pecaSelecionada) {
          const posicaoCapturasValidas = this.capturasValidas[`${this.pecaSelecionada[0]}_${this.pecaSelecionada[1]}`];
          const posicaoMovimentosValidos = this.movimentosValidos[`${this.pecaSelecionada[0]}_${this.pecaSelecionada[1]}`];
          const destino = `${rowIndex}_${colIndex}`;

          if (posicaoMovimentosValidos.find(movimento => movimento == destino)) {
            this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
            this.pecaSelecionada = null;
            this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
            moveu = true;
          } else if (posicaoCapturasValidas.find(captura => captura == destino)) {
            const meioX = (rowIndex + this.pecaSelecionada[0]) / 2;
            const meioY = (colIndex + this.pecaSelecionada[1]) / 2;
            if (this.tabuleiro[meioX][meioY] === 'goat') {
              this.tabuleiro[meioX][meioY] = null;
              this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
              this.pecaSelecionada = null;
              this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
              moveu = true;
              this.cabrasMortas++;
            }
          }
        }
      }
    }

    if (moveu) {
      this.jogadorAtual = this.jogadorAtual === 'tiger' ? 'goat' : 'tiger';
      this.vencedor = this.verificaVencedor(this.tabuleiro, this.cabrasMortas);

      if (this.vencedor) {
        this.openModalVencedor();
      }

      if (this.jogadorAtual !== this.jogador) {
        this.realizarJogadaComputador();
      }
    }
  }

  realizarJogadaComputador() {
    const melhorMovimento = this.getMelhorMovimento(this.jogadorAtual);
    if (melhorMovimento) {
      const [fromRow, fromCol] = melhorMovimento.from;
      const [toRow, toCol] = melhorMovimento.to;
      if (fromRow !== -1 && fromCol !== -1) this.pecaSelecionada = [fromRow, fromCol];
      setTimeout(() => { this.realizarJogada(toRow, toCol) }, 1000);
    }
  }

  private avaliar(profundidade: number = 0, tabuleiro: any, cabrasMortas: any): number {
    let pontuacao = 300 * this.tigresMovimentaveis(tabuleiro) + 700 * cabrasMortas - 700 * this.espacosFechados(tabuleiro) - profundidade;

    const vencedor = this.verificaVencedor(tabuleiro, cabrasMortas);
    if (vencedor === 'goat') {
      return -Infinity;
    } else if (vencedor === 'tiger') {
      return Infinity;
    }

    return pontuacao;
  }

  private espacosFechados(tabuleiro: any): number {
    let espacosFechadosCount = 0;
  
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (tabuleiro[row][col] === null) {
          const posicao = `${row}_${col}`;
          const movimentosValidos = this.movimentosValidos[posicao] || [];
          const capturasValidas = this.capturasValidas[posicao] || [];
  
          let cercadoPorCabras = true;
          for (const movimento of movimentosValidos) {
            const [novoRow, novoCol] = movimento.split('_').map(Number);
            if (tabuleiro[novoRow][novoCol] !== 'goat') {
              cercadoPorCabras = false;
              break;
            }
          }
  
          let acessivelPorTigre = false;
          for (const captura of capturasValidas) {
            const [novoRow, novoCol] = captura.split('_').map(Number);
            const meioRow = (row + novoRow) / 2;
            const meioCol = (col + novoCol) / 2;
            if (tabuleiro[novoRow][novoCol] === null && tabuleiro[meioRow][meioCol] === 'tiger') {
              acessivelPorTigre = true;
              break;
            }
          }
  
          if (cercadoPorCabras && !acessivelPorTigre) {
            espacosFechadosCount++;
          }
        }
      }
    }
  
    return espacosFechadosCount;
  }
  

  private gerarListaMovimentos(maximizingPlayer: boolean, tabuleiro: any, cabrasTabuleiro: any): { from: [number, number], to: [number, number] }[] {
    const movimentos: { from: [number, number], to: [number, number] }[] = [];
    let jogador = maximizingPlayer ? 'tiger' : 'goat';
  
    if (jogador === 'goat' && cabrasTabuleiro < 20) {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (tabuleiro[row][col] === null) {
            movimentos.push({ from: [-1, -1], to: [row, col] });
          }
        }
      }
    } else {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (tabuleiro[row][col] === jogador) {
            const posicao = `${row}_${col}`;
            const movimentosValidos = this.movimentosValidos[posicao] || [];
            const capturasValidas = this.capturasValidas[posicao] || [];
            let capturasValida = false;

            if (jogador === 'tiger') {
              for (const captura of capturasValidas) {
                const [novoRow, novoCol] = captura.split('_').map(Number);
                const meioRow = (row + novoRow) / 2;
                const meioCol = (col + novoCol) / 2;
                if (tabuleiro[novoRow][novoCol] === null && tabuleiro[meioRow][meioCol] === 'goat') {
                  movimentos.push({ from: [row, col], to: [novoRow, novoCol] });
                  capturasValida = true;
                }
              }
            }
            
            if (!capturasValida) {
              for (const movimento of movimentosValidos) {
                const [novoRow, novoCol] = movimento.split('_').map(Number);
                if (tabuleiro[novoRow][novoCol] === null) {
                  movimentos.push({ from: [row, col], to: [novoRow, novoCol] });
                }
              }
            }
          }
        }
      }
    }
    return movimentos;
  }
  

  private mover(tabuleiro: any, cabrasMortas: any, cabrasTabuleiro: any, movimento: { from: [number, number], to: [number, number] }, maximizingPlayer: boolean): any {
    const [fromRow, fromCol] = movimento.from;
    const [toRow, toCol] = movimento.to;
    let jogador: ('tiger' | 'goat') = maximizingPlayer ? 'tiger' : 'goat';
    if (fromRow === -1 && fromCol === -1) {
      tabuleiro[toRow][toCol] = 'goat';
      cabrasTabuleiro++;
    } else {
      const posicao = `${fromRow}_${fromCol}`;
      const destino = `${toRow}_${toCol}`;
      const capturasValidas = this.capturasValidas[posicao] || [];
      if (tabuleiro[fromRow][fromCol] === 'tiger' && capturasValidas.find(captura => captura == destino)) {
        const meioX = (toRow + fromRow) / 2;
        const meioY = (toCol + fromCol) / 2;
        if (tabuleiro[meioX][meioY] === 'goat') {
          tabuleiro[meioX][meioY] = null;
          cabrasMortas++;
        }
      }
  
      tabuleiro[toRow][toCol] = jogador;
      tabuleiro[fromRow][fromCol] = null;
    }
    return { tabuleiro, cabrasMortas, cabrasTabuleiro };
  }
  
  private minimax(profundidade: number, maximizingPlayer: boolean, alpha: number, beta: number, tabuleiro: any, cabrasMortas: any, cabrasTabuleiro: any): number {
    if (profundidade === 0 || this.verificaVencedor(tabuleiro, cabrasMortas) !== null) {
      return this.avaliar(profundidade, tabuleiro, cabrasMortas);
    }

    const movimentos = this.gerarListaMovimentos(maximizingPlayer, tabuleiro, cabrasTabuleiro);

    if (maximizingPlayer) {
      let pontuacaoMaxima = -Infinity;
      for (const movimento of movimentos) {
        let tabuleiroCopy = JSON.parse(JSON.stringify(tabuleiro));
        let cabrasMortasCopy = JSON.parse(JSON.stringify(cabrasMortas));
        let cabrasTabuleiroCopy = JSON.parse(JSON.stringify(cabrasTabuleiro));
        let ret = this.mover(tabuleiroCopy, cabrasMortasCopy, cabrasTabuleiroCopy, movimento, maximizingPlayer);
        tabuleiroCopy = ret.tabuleiro;
        cabrasMortasCopy = ret.cabrasMortas;
        cabrasTabuleiroCopy = ret.cabrasTabuleiro;
        const pontuacao = this.minimax(profundidade - 1, false, alpha, beta, tabuleiroCopy, cabrasMortasCopy, cabrasTabuleiroCopy);
        if (pontuacao > pontuacaoMaxima) {
          pontuacaoMaxima = pontuacao;
          if (profundidade === this.profundidade) {
            this.melhorMovimento = movimento;
          }
        }
        alpha = Math.max(alpha, pontuacao);
        if (beta <= alpha) {
          break;
        }
      }
      return pontuacaoMaxima;
    } else {
      let pontuacaoMinima = Infinity;
      for (const movimento of movimentos) {
        let tabuleiroCopy = JSON.parse(JSON.stringify(tabuleiro));
        let cabrasMortasCopy = JSON.parse(JSON.stringify(cabrasMortas));
        let cabrasTabuleiroCopy = JSON.parse(JSON.stringify(cabrasTabuleiro));
        let ret = this.mover(tabuleiroCopy, cabrasMortasCopy, cabrasTabuleiroCopy, movimento, maximizingPlayer);
        tabuleiroCopy = ret.tabuleiro;
        cabrasMortasCopy = ret.cabrasMortas;
        cabrasTabuleiroCopy = ret.cabrasTabuleiro;
        const pontuacao = this.minimax(profundidade - 1, true, alpha, beta, tabuleiroCopy, cabrasMortasCopy, cabrasTabuleiroCopy);
        if (pontuacao < pontuacaoMinima) {
          pontuacaoMinima = pontuacao;
          if (profundidade === this.profundidade) {
            this.melhorMovimento = movimento;
          }
        }
        beta = Math.min(beta, pontuacao);
        if (beta <= alpha) {
          break;
        }
      }
      return pontuacaoMinima;
    }
  }

  private getMelhorMovimento(player: 'goat' | 'tiger'): { from: [number, number], to: [number, number] } | null {
    this.jogadorAtual = player;
    this.melhorMovimento = null;
    this.minimax(this.profundidade, player === 'tiger', -Infinity, Infinity, this.tabuleiro, this.cabrasMortas, this.cabrasTabuleiro);
    return this.melhorMovimento;
  }

  verificaVencedor(tabuleiro: any, cabrasMortas: any) {
    if (cabrasMortas === 5) {
      return 'tiger';
    } else if(this.tigresMovimentaveis(tabuleiro) === 0) {
      return 'goat';
    }
    return null;
  }

  tigresMovimentaveis(tabuleiro: any): number {
    const tigres = [];
    let tigresMovimentaveis = 0;
    
    for (let i = 0; i < tabuleiro.length; i++) {
      for (let j = 0; j < tabuleiro[i].length; j++) {
        if (tabuleiro[i][j] === 'tiger') {
          tigres.push([i, j]);
        }
      }
    }
  
    for (const [x, y] of tigres) {
      const posicao = `${x}_${y}`;
      const movimentos = this.movimentosValidos[posicao] || [];
      const capturas = this.capturasValidas[posicao] || [];
      let tigreMovimental = false;
  
      for (const movimento of movimentos) {
        const [novoX, novoY] = movimento.split('_').map(Number);
        if (tabuleiro[novoX][novoY] === null) {
          tigreMovimental = true;
          break;
        }
      }
      
      if (!tigreMovimental) {
        for (const captura of capturas) {
          const [novoX, novoY] = captura.split('_').map(Number);
          const meioX = (x + novoX) / 2;
          const meioY = (y + novoY) / 2;
          if (tabuleiro[novoX][novoY] === null && tabuleiro[meioX][meioY] === 'goat') {
            tigreMovimental = true;
            break;
          }
        }
      }

      if (tigreMovimental) tigresMovimentaveis++;
    }
    return tigresMovimentaveis;
  }

  mutarMusica() {
    this.backgroundMusic.muted ? this.backgroundMusic.muted = false : this.backgroundMusic.muted = true;
  }
}

@Component({
  selector: 'dialog-vencedor',
  templateUrl: 'dialog-vencedor.html',
  styleUrls: ['./app.component.scss']
})
export class DialogVencedor {
  public vencedor: any;
  public jogador: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.vencedor = data.vencedor;
    this.jogador = data.jogador;
  }
}