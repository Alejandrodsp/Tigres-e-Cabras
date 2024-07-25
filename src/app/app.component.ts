import { Component, OnInit } from '@angular/core';

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
  backgroundMusic = new Audio();
  
  constructor() {}

  ngOnInit() {
    this.backgroundMusic.src = '../assets/background-music.mp3';
    this.backgroundMusic.load();
  }
  

  selecionarModoJogo(modo: 'goat' | 'tiger') {
    this.jogador = modo;
    this.backgroundMusic.play();
  }

  realizarJogada(rowIndex: number, colIndex: number) {
    let moveu = false;
    if (this.jogadorAtual === 'goat') {
      if (this.cabrasTabuleiro < 20) {
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
            this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
            this.pecaSelecionada = null;
            this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
            moveu = true;
          }
        }
      }
    } else {
      if (this.tabuleiro[rowIndex][colIndex] === this.jogadorAtual) {
        this.pecaSelecionada = [rowIndex, colIndex];
      } else if (this.tabuleiro[rowIndex][colIndex] === null) {
        if (this.pecaSelecionada) {
          const distancia = this.distanciaEuclidiana(rowIndex, colIndex, this.pecaSelecionada[0], this.pecaSelecionada[1]);
          if (distancia === 1) {
            this.tabuleiro[this.pecaSelecionada[0]][this.pecaSelecionada[1]] = null;
            this.pecaSelecionada = null;
            this.tabuleiro[rowIndex][colIndex] = this.jogadorAtual;
            moveu = true;
          } else if (distancia === 2) {
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
    if (moveu) this.jogadorAtual = this.jogadorAtual === 'tiger' ? 'goat' : 'tiger';
  }

  distanciaEuclidiana(x1: number, y1: number, x2: number, y2: number) {
    return Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
  }

  mutarMusica() {
    this.backgroundMusic.muted ? this.backgroundMusic.muted = false : this.backgroundMusic.muted = true;
  }
}
