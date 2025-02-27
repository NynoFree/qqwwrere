import React, { useState, useEffect } from 'react'; //усе стате хранение инфы которую меняем
import './App.css';

interface Score { // создание свойств
    game: number; // игра
    attempts: number; //попытки
    points: number; //очки
}

const App: React.FC = () => { //создание компанента
    const [secretNumber, setSecretNumber] = useState<number>(() => Math.floor(Math.random() * 100) + 1); // рандом число от 1 до 100
    const [attemptsCount, setAttemptsCount] = useState<number>(0); //кол-во попыток с 0
    const [guess, setGuess] = useState<number | null>(null); // скрытое число которое пишем
    const [message, setMessage] = useState<string>(''); // верно или не верно
    const [scores, setScores] = useState<Score[]>([]); // список результатов всех игр
    const [gameNumber, setGameNumber] = useState<number>(1); // номер игры с 1
    const [isScoreboardVisible, setIsScoreboardVisible] = useState<boolean>(true); //скрыть или показать
    const POINTS_PER_ATTEMPT: number = 25; // кол-во очков за попытки не верные
    const SCOREBOARD_KEY: string = 'guessTheNumberScoreboard'; //показывать таблицу

    useEffect(() => {
        loadScoreboard();
    }, []); // загрузка таблицы результатов 1

    const saveScoreboard = (newScores: Score[]) => {
        localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(newScores));
    }; // сохранение и перевод в формат JSON

    const loadScoreboard = () => {
        const storedData = localStorage.getItem(SCOREBOARD_KEY); // из локал стордж
        if (storedData) {
            const loadedScores: Score[] = JSON.parse(storedData); // текст в список
            setScores(loadedScores); // очки
            setGameNumber(loadedScores.length + 1); //номер игры
        }
    };


    const calculatePoints = (attempts: number): number => {
        const averageAttempts = getAverageAttempts();  //среднее количество попыток
        return Math.max(0, 1000 - (attempts - averageAttempts) * POINTS_PER_ATTEMPT); // макс очков 1000
    };

    const getAverageAttempts = (): number => {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((acc, score) => acc + score.attempts, 0);
        return sum / scores.length;
    }; //фул рассчет

    const handleGuess = () => {
        if (guess === null || isNaN(guess) || guess < 1 || guess > 100) {
            setMessage('число от 1 до 100.'); //проверка числа
            return;
        }

        setAttemptsCount(attemptsCount + 1);

        if (guess === secretNumber) {
            const points = calculatePoints(attemptsCount + 1);
            const newScore: Score = { game: gameNumber, attempts: attemptsCount + 1, points: Math.round(points) };
            const updatedScores = [...scores, newScore];

            setScores(updatedScores);
            saveScoreboard(updatedScores);
            setMessage(`угадал число ${secretNumber} за ${attemptsCount + 1} попыток! Ты получил ${Math.round(points)} очков.`);
            setGameNumber(gameNumber + 1);
        } else if (guess < secretNumber) {
            setMessage('Больше');
        } else {
            setMessage('Меньше');
        }
    };
    const handleRestart = () => {
        setSecretNumber(Math.floor(Math.random() * 100) + 1);
        setAttemptsCount(0);
        setGuess(null);
        setMessage('');
    }; // чистка всего для начать заново

    const handleResetScores = () => {
        localStorage.removeItem(SCOREBOARD_KEY);
        setScores([]);
        setGameNumber(1);
    }; // чистка только для результатов и удалние в сторэдж

    const handleToggleScoreboardVisibility = () => {
        setIsScoreboardVisible(!isScoreboardVisible);
    };

    return (
        <div className="app-container">
            <div className="game-container">
                <h1>Угадай число </h1>
                <p className="description">угадать за наименьшее число попыток!</p>

                <div className="input-area">
                    <input
                        type="number"
                        placeholder="Твое предположение"
                        value={guess === null ? '' : guess.toString()}
                        onChange={(e) => setGuess(Number(e.target.value))}
                    />
                    <button onClick={handleGuess}>Угадать</button>
                </div>

                <p id="message">{message}</p>
                <p id="attempts">Количество попыток: <span id="attemptsCount">{attemptsCount}</span></p>

                <button onClick={handleRestart}>Начать заново</button>
            </div>

            <div className="scoreboard-container">
                <h2>Таблица результатов</h2>
                <button onClick={handleToggleScoreboardVisibility}>
                    {isScoreboardVisible ? 'Скрыть результаты' : 'Показать результаты'}
                </button>
                {isScoreboardVisible && (
                    <table id="scoreboard">
                        <thead>
                        <tr>
                            <th>Игра</th>
                            <th>Попытки</th>
                            <th>Очки</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scores.map((score) => (
                            <tr key={score.game}>
                                <td>{score.game}</td>
                                <td>{score.attempts}</td>
                                <td>{score.points}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                <button onClick={handleResetScores}>Сбросить результаты</button>
            </div>
        </div>
    );
};

export default App;
