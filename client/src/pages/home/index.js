import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const Home = ({ username, setUsername, room, setRoom, socket }) => {
  const navigate = useNavigate();

  const joinRoom = () => {
    if (room !== '' && username !== '') {
      socket.emit('join_room', { username, room });
      navigate('/chat', { replace: true });
    } else {
      alert("Please enter username and select a room");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>{`<>ChatVerse 🚀</>`}</h1>

        <input
          className={styles.input}
          placeholder='Username...'
          onChange={(e) => setUsername(e.target.value)}
        />

        <select
          className={styles.input}
          onChange={(e) => setRoom(e.target.value)}
        >
          <option>-- Select Room --</option>
          <option value='general'>General Chat 🧑‍🤝‍🧑</option>
          <option value='interview-hub'>Interview Hub 🎯</option>
          <option value='project-collab'>Project Collab 🤝</option>
          <option value='chill-zone'>Chill Zone 🎧</option>
        </select>

        <button
          className='btn btn-secondary'
          style={{ width: '100%' }}
          onClick={joinRoom} // ✅ FIX HERE
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Home;
