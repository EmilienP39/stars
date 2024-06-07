import {  useEffect, useState } from 'react';
import axios from 'axios';
import type { Projet } from './interfaces/projet.ts';

function Counter() {
    const [count, setCount] = useState(0);
    const [projets, setProjets] = useState<Projet[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get('http://localhost:8000/projets');
                const allProjets: Projet[] = res.data as Projet[];
                setProjets(allProjets);
            } catch (err) {
                console.log(err);
            }
        }

        fetchData();
    }, []);

    return (
        <>
            <div>
                <div>Ici ça count {count}</div>
                <button onClick={() => setCount(count + 1)}> +</button>
                <button onClick={() => setCount(0)}> Reset</button>
                <button onClick={() => setCount(count - 1)}> -</button>
            </div>
            {projets.map((p) => (
                <div className="projets" key={p.id}>
                    <p>Cc ici ça projet</p>
                    <p>{p.nom}</p>
                    <img src={`http://localhost:8000/${p.image}`} alt={p.nom} />
                    <p>{p.date}</p>
                </div>
            ))}
        </>
    );
}

export default Counter;
