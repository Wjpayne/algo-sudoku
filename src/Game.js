import {Component} from 'react';
import sudokus from './Difficulty'
import SudokuGenerator from './SudokuGenerator'

export default class Game extends Component {
    constructor(props) {
        super(props)
        this.check = this.check.bind(this)
        this.solve = this.solve.bind(this)
        this.help = this.help.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }
    generate(level) {
        var puzzles
        switch (level) {
            case 'Very Easy':
                puzzles = sudokus.veryeasy
                break
            case 'Easy':
                puzzles = sudokus.easy
                break
            case 'Medium':
                puzzles = sudokus.medium
                break
            case 'Hard':
                puzzles = sudokus.tough
                break
            case 'Insane':
                puzzles = sudokus.verytough
                break
            default:
                puzzles = sudokus.hell
        }
        var grid = puzzles[Math.floor(Math.random() * puzzles.length)]
            , sudoku = new SudokuGenerator(grid).generate()
            , puzzle = sudoku[0]
        this.solution = sudoku[1]
        const origin = new Set()
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (puzzle[i][j]) {
                    origin.add(i + '' + j)
                }
            }
        }
        this.setState({
            values: puzzle,
            level: level,
            peep: false,
            origin: origin,
            chosen: null,
            possible: null,
            filter: new Set(),
            highlight: new Set(),
            check: false,
            helps: 3,
            conflict: new Set()
        })
    }
    componentWillMount() {
        this.generate('easy')
    }
    checkPossible(i, j) {
        var values = this.state.values
        var allPossible = new Set([...'123456789'])
        for (let k = 0; k <= 8; k++) {
            if (k === j) { continue }
            if (allPossible.has(values[i][k])) {
                allPossible.delete(values[i][k])
            }
        }
        for (let k = 0; k <= 8; k++) {
            if (k === i) { continue }
            if (allPossible.has(values[k][j])) {
                allPossible.delete(values[k][j])
            }
        }
        var bi = Math.floor(i / 3) * 3,
            bj = Math.floor(j / 3) * 3
        for (let m = bi; m < bi + 3; m++) {
            for (let n = bj; n < bj + 3; n++) {
                if (m === i && n === j) {
                    continue
                }
                if (allPossible.has(values[m][n])) {
                    allPossible.delete(values[m][n])
                }
            }
        }
        return allPossible
    }
    filter(value) {
        var values = this.state.values
        var filter = new Set()
        for (let m = 0; m < 9; m++) {
            for (let n = 0; n < 9; n++) {
                if (values[m][n] === value) {
                    filter.add(m + '' + n)
                }
            }
        }
        this.setState({
            filter: filter,
            highlight: new Set(),
            chosen: null
        })
    }
    highlight(i, j) {
        var values = this.state.values
        var highlight = new Set()
        for (let k = 0; k < 9; k++) {
            if (values[i][k]) {
                highlight.add(i + '' + k)
            }
        }
        for (let k = 0; k < 9; k++) {
            if (values[k][j]) {
                highlight.add(k + '' + j)
            }
        }
        var line = Math.floor(i / 3) * 3,
            row = Math.floor(j / 3) * 3
        for (let ln = line; ln < line + 3; ln++) {
            for (let r = row; r < row + 3; r++) {
                if (values[ln][r]) {
                    highlight.add(ln + '' + r)
                }
            }
        }
        this.setState({
            highlight: highlight,
            filter: new Set()
        })
    }
    help() {
        var solution = this.solution,
            values = this.state.values.slice(),
            chosen = this.state.chosen,
            helps = this.state.helps
        if (!chosen || this.state.origin.has(chosen[0] + '' + chosen[1]) || !this.state.helps) {
            return
        } else {
            var solutionValue = solution[chosen[0]][chosen[1]]
            values[chosen[0]][chosen[1]] = solutionValue
            helps -= 1
            var conflict = new Set()
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (!values[i][j]) {
                        continue
                    } else {
                        var thisvalue = values[i][j],
                            possible = this.checkPossible(i, j)
                        if (!possible.has(thisvalue)) {
                            conflict.add(i + '' + j)
                        }
                    }
                }
            }
            this.setState({
                values: values,
                helps: helps,
                conflict: conflict
            })
        }
    }
    check() {
        this.setState({
            check: true
        })
    }
    solve() {
        if (this.state.peep) {
            return
        }
        var r = window.confirm("confirm")
        if (!r) {
            return
        } else {
            this.setState({
                values: this.solution,
                peep: true,
                conflict: new Set(),
                highlight: new Set(),
                filter: new Set(),
            })
        }

    }
    handleClick(i, j) {
        var values = this.state.values.slice()
        var thisvalue = values[i].slice()
        if (this.state.origin.has(i + '' + j)) {
            this.filter(thisvalue[j])
            return
        } else {
            this.highlight(i, j)
            var chosen = i + '' + j
            var possible = Array.from(this.checkPossible(i, j)).toString()
            this.setState({
                chosen: chosen,
                possible: possible,
                filter: new Set(),
                check: false
            });
        }
    }
    handleNumsClick(i) {
        if (this.state.peep) { return }
        var chosen = this.state.chosen
        if (!chosen) {
            this.filter('' + i)
        } else {
            var values = this.state.values.slice()
            if (this.state.origin.has([chosen[0]][chosen[1]])) {
                this.setState({
                    chosen: null,
                    highlight: new Set()
                })
                return
            }
            if (i === 'X') {
                values[chosen[0]][chosen[1]] = null
            } else {
                values[chosen[0]][chosen[1]] = '' + i
            }
            var conflict = new Set()
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (!values[i][j]) {
                        continue
                    } else {
                        var thisvalue = values[i][j],
                            possible = this.checkPossible(i, j)
                        if (!possible.has(thisvalue)) {
                            conflict.add(i + '' + j)
                        }
                    }
                }
            }
            this.setState(
                {
                    values: values,
                    highlight: new Set(),
                    conflict: conflict,
                    chosen: null
                }
            )
            if (!this.state.peep && values.toString() === this.solution.toString()) {
                alert('Congrats!')
                this.setState({
                    peep: true
                })
            }
        }
    }
}

    