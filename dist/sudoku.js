'use strict';

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function isIn (v, seq) {
    /* Return if a value `v` is in sequence `seq`.*/
    if (typeof seq.indexOf == "function") {
        return seq.indexOf(v) !== -1;
    }
    return Object.values(seq).indexOf(v) !== -1;
}

var Sudoku = /** @class */ (function () {
    function Sudoku(debug) {
        if (debug === void 0) { debug = false; }
        this.BLOCKS = [];
        this.SQUARES = null; // Square IDs
        this.UNITS = null; // All units (row, column, or box)
        this.SQUARE_UNITS_MAP = null; // Squares -> units map
        this.SQUARE_PEERS_MAP = null; // Squares -> peers map
        this.debug = debug;
        /* Initialize the Sudoku library (invoked after library load)a
          */
        this.SQUARES = this._cross(Sudoku.ROWS, Sudoku.COLS);
        this.UNITS = this._get_all_units(Sudoku.ROWS, Sudoku.COLS);
        this.SQUARE_UNITS_MAP = this._get_square_units_map(this.SQUARES, this.UNITS);
        this.SQUARE_PEERS_MAP = this._get_square_peers_map(this.SQUARES, this.SQUARE_UNITS_MAP);
        this.BLOCKS = [
            this._cross("ABC", "123"),
            this._cross("ABC", "456"),
            this._cross("ABC", "789"),
            this._cross("DEF", "123"),
            this._cross("DEF", "456"),
            this._cross("DEF", "789"),
            this._cross("GHI", "123"),
            this._cross("GHI", "456"),
            this._cross("GHI", "789"),
        ];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Sudoku.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.debug) {
            console.log.apply(null, args);
        }
    };
    Sudoku.prototype._cross = function (a, b) {
        /* Cross product of all elements in `a` and `b`, e.g.,
          sudoku._cross("abc", "123") ->
          ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"]
          */
        var result = [];
        for (var ai in a.split("")) {
            for (var bi in b.split("")) {
                result.push(a[ai] + b[bi]);
            }
        }
        return result;
    };
    Sudoku.prototype._get_all_units = function (rows, cols) {
        /* Return a list of all units (rows, cols, boxes) */
        var units = [];
        // Rows
        for (var ri in rows.split("")) {
            units.push(this._cross(rows[ri], cols));
        }
        // Columns
        for (var ci in cols.split("")) {
            units.push(this._cross(rows, cols[ci]));
        }
        // Boxes
        var row_squares = ['ABC', 'DEF', 'GHI'];
        var col_squares = ['123', '456', '789'];
        for (var rsi in row_squares) {
            for (var csi in col_squares) {
                units.push(this._cross(row_squares[rsi], col_squares[csi]));
            }
        }
        return units;
    };
    Sudoku.prototype._get_square_units_map = function (squares, units) {
        /* Return a map of `squares` and their associated units (row, col, box) */
        var square_unit_map = {};
        // For every square...
        for (var si in squares) {
            var cur_square = squares[si];
            // Maintain a list of the current square's units
            var cur_square_units = [];
            // Look through the units, and see if the current square is in it,
            // and if so, add it to the list of of the square's units.
            for (var ui in units) {
                var cur_unit = units[ui];
                if (cur_unit.indexOf(cur_square) !== -1) {
                    cur_square_units.push(cur_unit);
                }
            }
            // Save the current square and its units to the map
            square_unit_map[cur_square] = cur_square_units;
        }
        return square_unit_map;
    };
    // Necessary to overcome the need to define all records completely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Sudoku.prototype._get_square_peers_map = function (squares, units_map) {
        /* Return a map of `squares` and their associated peers, i.e., a set of
            other squares in the square's unit.
            */
        var square_peers_map = {};
        // For every square...
        for (var si in squares) {
            var cur_square = squares[si];
            var cur_square_units = units_map[cur_square];
            // Maintain list of the current square's peers
            var cur_square_peers = [];
            // Look through the current square's units map...
            for (var sui in cur_square_units) {
                var cur_unit = cur_square_units[sui];
                for (var ui in cur_unit) {
                    var cur_unit_square = cur_unit[ui];
                    if (cur_square_peers.indexOf(cur_unit_square) === -1
                        && cur_unit_square !== cur_square) {
                        cur_square_peers.push(cur_unit_square);
                    }
                }
            }
            // Save the current square an its associated peers to the map
            square_peers_map[cur_square] = cur_square_peers;
        }
        return square_peers_map;
    };
    Sudoku.prototype._coordinates_of = function (index) {
        var rowIndex = Math.floor(index / 9);
        var colIndex = 9 - index % 9;
        return { col: colIndex, row: rowIndex };
    };
    // Utility
    // -------------------------------------------------------------------------
    Sudoku.prototype.print_board = function (board) {
        /* Print a sudoku `board` to the console. */
        // Assure a valid board
        var report = this.validate_board(board);
        if (report !== true) {
            throw report;
        }
        var V_PADDING = ' '; // Insert after each square
        var H_PADDING = '\n'; // Insert after each row
        var V_BOX_PADDING = '  '; // Box vertical padding
        var H_BOX_PADDING = '\n'; // Box horizontal padding
        var display_string = '';
        for (var iterator in board.split("")) {
            var i = parseInt(iterator);
            var square = board[i];
            // Add the square and some padding
            display_string += square + V_PADDING;
            // Vertical edge of a box, insert v. box padding
            if (i % 3 === 2) {
                display_string += V_BOX_PADDING;
            }
            // End of a line, insert horiz. padding
            if (i % 9 === 8) {
                display_string += H_PADDING;
            }
            // Horizontal edge of a box, insert h. box padding
            if (i % 27 === 26) {
                display_string += H_BOX_PADDING;
            }
        }
        console.log(display_string);
    };
    Sudoku.prototype.validate_board = function (board, errorAsCoordinates) {
        /* Return if the given `board` is valid or not. If it's valid, return
            true. If it's not, return a string of the reason why it's not.
        */
        var _this = this;
        if (errorAsCoordinates === void 0) { errorAsCoordinates = false; }
        // Check for empty board
        if (!board) {
            throw new Error('Empty board');
        }
        // Invalid board length
        if (board.length !== Sudoku.NR_SQUARES) {
            throw new Error("Invalid board size. Board must be exactly " + Sudoku.NR_SQUARES + " squares.");
        }
        // Check for invalid characters
        var boardArray = board.split("");
        boardArray.forEach(function (letter, i) {
            if (!isIn(boardArray[i], Sudoku.DIGITS.split("")) && boardArray[i] !== Sudoku.BLANK_CHAR) {
                return errorAsCoordinates ? _this._coordinates_of(i) : "Invalid board character " + letter + " encountered at index " + i + ": " + boardArray[i];
            }
        });
        // Otherwise, we're good. Return true.
        return true;
    };
    Sudoku.prototype.assign = function (candidates, square, val) {
        /* Eliminate all values, *except* for `val`, from `candidates` at
            `square` (candidates[square]), and propagate. Return the candidates map
            when finished. If a contradiciton is found, return false.
    
            WARNING: This will modify the contents of `candidates` directly.
        */
        // Grab a list of canidates without 'val'
        var other_vals = candidates[square] ? candidates[square].replace(val, '').split("") : [];
        // Loop through all other values and eliminate them from the candidates
        // at the current square, and propigate. If at any point we get a
        // contradiction, return false.
        for (var ovi in other_vals) {
            var other_val = other_vals[ovi];
            var candidates_next = this.eliminate(candidates, square, other_val);
            if (!candidates_next) {
                // console.log("Contradiction found by _eliminate.");
                return false;
            }
        }
        return candidates;
    };
    Sudoku.prototype.eliminate = function (candidates, square, val) {
        /* Eliminate `val` from `candidates` at `square`, (candidates[square]),
            and propagate when values or places <= 2. Return updated candidates,
            unless a contradiction is detected, in which case, return false.
    
            WARNING: This will modify the contents of `candidates` directly.
          */
        // If `val` has already been eliminated from candidates[square], return
        // with candidates.
        if (!isIn(val, candidates[square].split(""))) {
            return candidates;
        }
        // Remove `val` from candidates[square]
        candidates[square] = candidates[square].replace(val, '');
        // If the square has only candidate left, eliminate that value from its
        // peers
        var nr_candidates = candidates[square].length;
        if (nr_candidates === 1) {
            var target_val = candidates[square];
            for (var pi in Object.keys(this.SQUARE_PEERS_MAP[square])) {
                var peer = this.SQUARE_PEERS_MAP[square][pi];
                var candidates_new = this.eliminate(candidates, peer, target_val);
                if (!candidates_new) {
                    return false;
                }
            }
            // Otherwise, if the square has no candidates, we have a contradiction.
            // Return false.
        }
        if (nr_candidates === 0) {
            return false;
        }
        // If a unit is reduced to only one place for a value, then assign it
        for (var ui in Object.keys(this.SQUARE_UNITS_MAP[square])) {
            var unit = this.SQUARE_UNITS_MAP[square][ui];
            var val_places = [];
            for (var si in unit) {
                var unit_square = unit[si];
                if (isIn(val, candidates[unit_square].split(""))) {
                    val_places.push(unit_square);
                }
            }
            // If there's no place for this value, we have a contradition!
            // return false
            if (val_places.length === 0) {
                return false;
                // Otherwise the value can only be in one place. Assign it there.
            }
            if (val_places.length === 1) {
                var candidates_new = this.assign(candidates, val_places[0], val);
                if (!candidates_new) {
                    return false;
                }
            }
        }
        return candidates;
    };
    Sudoku.DIGITS = '123456789'; // Allowed sudoku.DIGITS
    Sudoku.ROWS = 'ABCDEFGHI'; // Row lables
    Sudoku.COLS = Sudoku.DIGITS; // Column lables
    // Define difficulties by how many squares are given to the player in a new
    // puzzle.
    Sudoku.DIFFICULTY = {
        easy: 62,
        medium: 53,
        hard: 44,
        'very-hard': 35,
        insane: 26,
        inhuman: 17,
    };
    // Blank character and board representation
    Sudoku.BLANK_CHAR = '.';
    Sudoku.BLANK_BOARD = '.'.repeat(81);
    Sudoku.MIN_GIVENS = 17; // Minimum number of givens
    Sudoku.NR_SQUARES = 81; // Number of squares
    return Sudoku;
}());

var SudokuGetCandidates = /** @class */ (function () {
    function SudokuGetCandidates(instance, debug) {
        if (debug === void 0) { debug = false; }
        this.debug = debug;
        this.instance = instance;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SudokuGetCandidates.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.debug) {
            console.log.apply(null, args);
        }
    };
    SudokuGetCandidates.prototype.get = function (board) {
        this.log("Getting all candidates");
        /* Return all possible candidatees for each square as a grid of
            candidates, returnning `false` if a contradiction is encountered.
    
            Really just a wrapper for sudoku._get_candidates_map for programmer
            consumption.
            */
        // Assure a valid board
        var report = this.instance.validate_board(board);
        if (report !== true) {
            throw report;
        }
        this.log("Board valid");
        // Get a candidates map
        var candidates_map = this.map(board);
        this.log("Current map: ", candidates_map);
        // If there's an error, return false
        if (!candidates_map) {
            return false;
        }
        // Transform candidates map into grid
        var rows = [];
        var cur_row = [];
        var i = 0;
        for (var _i = 0, _a = Object.keys(candidates_map); _i < _a.length; _i++) {
            var square = _a[_i];
            var candidates = candidates_map[square];
            cur_row.push(candidates);
            if (i % 9 == 8) {
                rows.push(cur_row);
                cur_row = [];
            }
            ++i;
        }
        this.log("Returned grid: ", rows);
        return rows;
    };
    SudokuGetCandidates.prototype.map = function (board) {
        /*  Get all possible candidates for each square as a map in the form
            {square: sudoku.DIGITS} using recursive constraint propagation. Return `false`
            if a contradiction is encountered
        */
        // Assure a valid board
        var report = this.instance.validate_board(board);
        if (report !== true) {
            throw report;
        }
        var candidate_map = {};
        var squares_values_map = this._get_square_vals_map(board);
        // Start by assigning every digit as a candidate to every square
        for (var si in this.instance.SQUARES) {
            candidate_map[this.instance.SQUARES[si]] = Sudoku.DIGITS;
        }
        // For each non-blank square, assign its value in the candidate map and
        // propigate.
        for (var square in squares_values_map) {
            var val = squares_values_map[square];
            if (isIn(val, Sudoku.DIGITS.split(""))) {
                var new_candidates = this.instance.assign(candidate_map, square, val);
                // Fail if we can't assign val to square
                if (!new_candidates) {
                    return false;
                }
            }
        }
        return candidate_map;
    };
    SudokuGetCandidates.prototype._get_square_vals_map = function (board) {
        /* Return a map of squares -> values
            */
        var squares_vals_map = {};
        // Make sure `board` is a string of length 81
        if (board.length != this.instance.SQUARES.length) {
            throw 'Board/squares length mismatch.';
        }
        else {
            for (var i in this.instance.SQUARES) {
                squares_vals_map[this.instance.SQUARES[i]] = board[i];
            }
        }
        return squares_vals_map;
    };
    return SudokuGetCandidates;
}());

var SudokuSolver = /** @class */ (function () {
    function SudokuSolver(instance, debug) {
        if (debug === void 0) { debug = false; }
        this.debug = debug;
        this.instance = instance;
        this.getCandidates = new SudokuGetCandidates(instance);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SudokuSolver.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.debug) {
            console.log.apply(null, args);
        }
    };
    SudokuSolver.prototype.solve = function (board, reverse) {
        /* Solve a sudoku puzzle given a sudoku `board`, i.e., an 81-character
            string of sudoku.DIGITS, 1-9, and spaces identified by '.', representing the
            squares. There must be a minimum of 17 givens. If the given board has no
            solutions, return false.
    
            Optionally set `reverse` to solve "backwards", i.e., rotate through the
            possibilities in reverse. Useful for checking if there is more than one
            solution.
            */
        if (reverse === void 0) { reverse = false; }
        // Assure a valid board
        var report = this.instance.validate_board(board);
        if (report !== true) {
            throw report;
        }
        // Check number of givens is at least MIN_GIVENS
        var nr_givens = 0;
        var boardArray = board.split("");
        for (var i in boardArray) {
            if (board[i] !== Sudoku.BLANK_CHAR && isIn(boardArray[i], Sudoku.DIGITS.split(""))) {
                ++nr_givens;
            }
        }
        if (nr_givens < Sudoku.MIN_GIVENS) {
            throw "Too few givens. Minimum givens is " + Sudoku.MIN_GIVENS;
        }
        var candidates = this.getCandidates.map(board);
        if (typeof candidates !== "boolean") {
            var result = this.search(candidates, reverse);
            if (typeof result !== "boolean") {
                var solution = '';
                for (var square in result) {
                    solution += result[square];
                }
                return solution;
            }
        }
        return false;
    };
    SudokuSolver.prototype.search = function (candidates, reverse) {
        /* Given a map of squares -> candiates, using depth-first search,
           recursively try all possible values until a solution is found, or false
           if no solution exists.
        */
        if (reverse === void 0) { reverse = false; }
        // Return if error in previous iteration
        if (!candidates) {
            return false;
        }
        // If only one candidate for every square, we've a solved puzzle!
        // Return the candidates map.
        var max_nr_candidates = 0;
        for (var si in this.instance.SQUARES) {
            var square = this.instance.SQUARES[si];
            var nr_candidates = candidates[square].length;
            if (nr_candidates > max_nr_candidates) {
                max_nr_candidates = nr_candidates;
            }
        }
        if (max_nr_candidates === 1) {
            return candidates;
        }
        // Choose the blank square with the fewest possibilities > 1
        var min_nr_candidates = 10;
        var min_candidates_square = null;
        for (var si in this.instance.SQUARES) {
            var square = this.instance.SQUARES[si];
            var nr_candidates = candidates[square].length;
            if (nr_candidates < min_nr_candidates && nr_candidates > 1) {
                min_nr_candidates = nr_candidates;
                min_candidates_square = square;
            }
        }
        // Recursively search through each of the candidates of the square
        // starting with the one with fewest candidates.
        // Rotate through the candidates forwards
        var min_candidates = candidates[min_candidates_square].split("");
        if (!reverse) {
            for (var vi in min_candidates) {
                var val = min_candidates[vi];
                // TODO: Implement a non-rediculous deep copy function
                var candidates_copy = Object.assign({}, candidates);
                var newCandidates = this.instance.assign(candidates_copy, min_candidates_square, val);
                if (typeof newCandidates === "boolean") {
                    return false;
                }
                var candidates_next = this.search(newCandidates);
                if (candidates_next) {
                    return candidates_next;
                }
            }
            // Rotate through the candidates backwards
        }
        else {
            for (var vi = min_candidates.length - 1; vi >= 0; --vi) {
                var val = min_candidates[vi];
                // TODO: Implement a non-rediculous deep copy function
                var candidates_copy = Object.assign({}, candidates);
                var newCandidates = this.instance.assign(candidates_copy, min_candidates_square, val);
                if (typeof newCandidates === "boolean") {
                    return false;
                }
                var candidates_next = this.search(newCandidates, reverse);
                if (candidates_next) {
                    return candidates_next;
                }
            }
        }
        // If we get through all combinations of the square with the fewest
        // candidates without finding an answer, there isn't one. Return false.
        return false;
    };
    return SudokuSolver;
}());

var SudokuGenerator = /** @class */ (function () {
    function SudokuGenerator(instance, debug) {
        if (debug === void 0) { debug = false; }
        this.debug = debug;
        this.instance = instance;
        this.solver = new SudokuSolver(this.instance);
        this.getCandidates = new SudokuGetCandidates(this.instance);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SudokuGenerator.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.debug) {
            console.log.apply(null, args);
        }
    };
    SudokuGenerator.prototype.generate = function (difficulty, unique, withSolution) {
        /* Generate a new Sudoku puzzle of a particular `difficulty`, e.g.,
    
                // Generate an "easy" sudoku puzzle
                sudoku.generate("easy");
    
            Difficulties are as follows, and represent the number of given squares:
    
                    "easy":         61
                    "medium":       52
                    "hard":         43
                    "very-hard":    34
                    "insane":       25
                    "inhuman":      17
    
            You may also enter a custom number of squares to be given, e.g.,
    
                // Generate a new Sudoku puzzle with 60 given squares
                sudoku.generate(60)
    
            `difficulty` must be a number between 17 and 81 inclusive. If it's
            outside of that range, `difficulty` will be set to the closest bound,
            e.g., 0 -> 17, and 100 -> 81.
    
            By default, the puzzles are unique, uless you set `unique` to false.
            (Note: Puzzle uniqueness is not yet implemented, so puzzles are *not*
            guaranteed to have unique solutions)
    
            TODO: Implement puzzle uniqueness
            */
        if (unique === void 0) { unique = true; }
        if (withSolution === void 0) { withSolution = false; }
        // If `difficulty` is a string or undefined, convert it to a number or
        // default it to "easy" if undefined.
        if (typeof difficulty === 'string' || typeof difficulty === 'undefined') {
            difficulty = Sudoku.DIFFICULTY[difficulty] || Sudoku.DIFFICULTY.easy;
        }
        // Force difficulty between 17 and 81 inclusive
        difficulty = this._force_range(difficulty, Sudoku.NR_SQUARES + 1, Sudoku.MIN_GIVENS);
        this.log("Generating game with difficulty of: ", difficulty);
        // Get a set of squares and all possible candidates for each square
        var blank_board = '';
        for (var i = 0; i < Sudoku.NR_SQUARES; ++i) {
            blank_board += '.';
        }
        var candidates = this.getCandidates.map(blank_board);
        if (typeof candidates == "boolean") {
            throw new Error("Cannot define candidates for " + blank_board);
        }
        this.log("Candidates for blank board: ", candidates);
        // For each item in a shuffled list of squares
        var shuffled_squares = this._shuffle(this.instance.SQUARES);
        this.log("Shuffled squares: ", shuffled_squares);
        for (var si in shuffled_squares) {
            var square = shuffled_squares[si];
            // If an assignment of a random chioce causes a contradiction, give
            // up and try again
            var rand_candidate_idx = this._rand_range(candidates[square].length);
            var rand_candidate = candidates[square][rand_candidate_idx];
            this.log("Assigning ranom values: ", {
                rand_candidate_idx: rand_candidate_idx, rand_candidate: rand_candidate
            });
            if (this.instance.assign(candidates, square, rand_candidate) === false) {
                this.log("Random contradiction found -> exiting");
                break;
            }
            // Make a list of all single candidates
            var single_candidates = [];
            for (var si_1 in this.instance.SQUARES) {
                var square_1 = this.instance.SQUARES[si_1];
                if (candidates[square_1].length == 1) {
                    single_candidates.push(candidates[square_1]);
                }
            }
            this.log("Single candidates found: ", single_candidates);
            // If we have at least difficulty, and the unique candidate count is
            // at least 8, return the puzzle!
            if (single_candidates.length >= difficulty
                && this._strip_dups(single_candidates).length >= 8) {
                this.log("Difficulty grade reached, creating board");
                var board = '';
                var givens_idxs = [];
                for (var i in this.instance.SQUARES) {
                    var square_2 = this.instance.SQUARES[i];
                    if (candidates[square_2].length == 1) {
                        board += candidates[square_2];
                        givens_idxs.push(i);
                    }
                    else {
                        board += Sudoku.BLANK_CHAR;
                    }
                }
                this.log("Board created so far: ", board);
                // If we have more than `difficulty` givens, remove some random
                // givens until we're down to exactly `difficulty`
                var nr_givens = givens_idxs.length;
                if (nr_givens > difficulty) {
                    givens_idxs = this._shuffle(givens_idxs);
                    for (var i = 0; i < nr_givens - difficulty; ++i) {
                        var target = parseInt(givens_idxs[i]);
                        board = board.substr(0, target) + Sudoku.BLANK_CHAR
                            + board.substr(target + 1);
                    }
                }
                this.log("Board created after checking difficulty again: ", board);
                // Double check board is solvable
                // TODO: Make a standalone board checker. Solve is expensive.
                var solution = this.solver.solve(board);
                if (typeof solution == "string") {
                    if (withSolution === true) {
                        return {
                            board: board,
                            solution: solution
                        };
                    }
                    return board;
                }
            }
        }
        // Give up and try a new puzzle
        return this.generate(difficulty, unique, withSolution);
    };
    SudokuGenerator.prototype._force_range = function (nr, max, min) {
        /* Force `nr` to be within the range from `min` to, but not including,
            `max`. `min` is optional, and will default to 0. If `nr` is undefined,
            treat it as zero.
            */
        min = min || 0;
        nr = nr || 0;
        if (nr < min) {
            return min;
        }
        if (nr > max) {
            return max;
        }
        return nr;
    };
    SudokuGenerator.prototype._shuffle = function (seq) {
        /* Return a shuffled version of `seq`
            */
        // Create an array of the same size as `seq` filled with false
        var shuffled = [];
        for (var i = 0; i < seq.length; ++i) {
            shuffled.push(false);
        }
        for (var i in seq) {
            var ti = this._rand_range(seq.length);
            while (shuffled[ti]) {
                ti = (ti + 1) > (seq.length - 1) ? 0 : (ti + 1);
            }
            shuffled[ti] = seq[i];
        }
        return shuffled;
    };
    SudokuGenerator.prototype._rand_range = function (max, min) {
        /* Get a random integer in the range of `min` to `max` (non inclusive).
            If `min` not defined, default to 0. If `max` not defined, throw an
            error.
        */
        if (min === void 0) { min = 0; }
        var cleanMin = parseInt(min);
        var cleanMax = parseInt(max);
        if (cleanMax) {
            return Math.floor(Math.random() * (cleanMax - cleanMin)) + cleanMin;
        }
        throw 'Range undefined';
    };
    SudokuGenerator.prototype._strip_dups = function (seq) {
        /* Strip duplicate values from `seq`
            */
        var seq_set = [];
        var dup_map = {};
        for (var i in seq) {
            var e = seq[i];
            if (!dup_map[e]) {
                seq_set.push(e);
                dup_map[e] = true;
            }
        }
        return seq_set;
    };
    return SudokuGenerator;
}());

var board_string_to_grid = function (board_string) {
    /* Convert a board string to a two-dimensional array  */
    var rows = [];
    var boardStringArray = board_string.split("");
    var cur_row = [];
    for (var i in boardStringArray) {
        cur_row.push(boardStringArray[i]);
        if (parseInt(i) % 9 == 8) {
            rows.push(cur_row);
            cur_row = [];
        }
    }
    return rows;
};
var board_grid_to_string = function (board_grid) {
    /* Convert a board grid to a string */
    var board_string = '';
    for (var r = 0; r < 9; ++r) {
        for (var c = 0; c < 9; ++c) {
            board_string += board_grid[r][c];
        }
    }
    return board_string;
};
var board_string_to_object = function (board_string) {
    /* Convert a board object from a string */
    var boardStringArray = board_string.split("");
    var boardObject = {};
    var boardStringIterator = 0;
    Sudoku.ROWS.split("").forEach(function (row) {
        Sudoku.COLS.split("").forEach(function (col) {
            boardObject["" + row + col] = boardStringArray[boardStringIterator];
            boardStringIterator++;
        });
    });
    return boardObject;
};
var board_object_to_string = function (boardObject) {
    /* Convert a board object from a string */
    var boardStringArray = [];
    var boardStringIterator = 0;
    Sudoku.ROWS.split("").forEach(function (row) {
        Sudoku.COLS.split("").forEach(function (col) {
            boardStringArray[boardStringIterator] = boardObject["" + row + col];
            boardStringIterator++;
        });
    });
    return boardStringArray.join("");
};
var conversions = {
    stringToGrid: board_string_to_grid,
    gridToString: board_grid_to_string,
    stringToObject: board_string_to_object,
    objectToString: board_object_to_string
};

function getSudoku(debug) {
    if (debug === void 0) { debug = false; }
    var instance = new Sudoku(debug);
    var generator = new SudokuGenerator(instance, debug);
    var solver = new SudokuSolver(instance, debug);
    var getCandidates = new SudokuGetCandidates(instance, debug);
    var statics = Object.freeze({
        DIGITS: Sudoku.DIGITS,
        ROWS: Sudoku.ROWS,
        COLS: Sudoku.COLS,
        DIFFICULTY: Sudoku.DIFFICULTY,
        BLANK_CHAR: Sudoku.BLANK_CHAR,
        BLANK_BOARD: Sudoku.BLANK_BOARD,
        MIN_GIVENS: Sudoku.MIN_GIVENS,
        NR_SQUARES: Sudoku.NR_SQUARES,
        BLOCKS: instance.BLOCKS
    });
    return {
        statics: statics,
        instance: instance,
        generator: generator,
        solver: solver,
        getCandidates: getCandidates,
        conversions: conversions
    };
}

module.exports = getSudoku;
