<template>
  <div class="game-container">
    <!-- Обратный отсчет -->
    <div v-if="showCountdown" class="countdown">
      <div class="countdown-number">{{ countdown }}</div>
      <div class="countdown-text">GET READY!</div>
    </div>
    
    <!-- Игровой интерфейс -->
    <div class="game-ui">
      <!-- Прогресс-бар времени -->
      <div class="time-bar-container">
        <div class="time-bar" :style="{ width: timePercent + '%' }"></div>
        <div class="time-text">{{ time }}s</div>
      </div>
      
      <!-- Счет -->
      <div class="score-display">
        <div class="score">{{ score }}</div>
        <div class="best-score">Best: {{ bestScore }}</div>
      </div>
    </div>
    
    <!-- Игровое поле -->
    <div class="game-area">
      <!-- Предметы -->
      <div 
        v-for="item in items" 
        :key="item.id"
        class="item"
        :class="item.type"
        :style="{ left: item.x + 'px', top: item.y + 'px' }"
      >
        {{ item.icon }}
      </div>
      
      <!-- Ведро -->
      <div 
        class="bucket" 
        :style="{ left: bucketPosition + 'px' }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      >
        🗑️
      </div>
    </div>
    
    <!-- Градиент -->
    <div class="gradient"></div>
    
    <!-- Результат -->
    <div v-if="gameOver" class="game-over">
      <h2>GAME OVER</h2>
      <p class="final-score">Score: {{ score }}</p>
      <p class="final-best">Best: {{ bestScore }}</p>
      <p v-if="isNewRecord" class="new-record">🎉 NEW RECORD!</p>
      <button @click="restartGame">PLAY AGAIN</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, collection } from 'firebase/firestore'

export default {
  name: 'DarkCatchGame',
  
  setup() {
    // Firebase конфигурация
    const firebaseConfig = {
      apiKey: "AIzaSyA8rX6_Xv9PzDlIkskaOpGIxInrhHVVWwY",
      authDomain: "hateusersbot.firebaseapp.com",
      projectId: "hateusersbot",
      storageBucket: "hateusersbot.firebasestorage.app",
      messagingSenderId: "57127310738",
      appId: "1:57127310738:web:fc736be930b64a861c5d4b"
    }
    
    // Состояния
    const time = ref(60)
    const score = ref(0)
    const bestScore = ref(0)
    const gameOver = ref(false)
    const isPlaying = ref(false)
    const showCountdown = ref(true)
    const countdown = ref(5)
    const isNewRecord = ref(false)
    
    // Игровые элементы
    const bucketPosition = ref(0)
    const items = ref([])
    const userData = ref({ id: null, username: 'Guest', firstName: 'Guest' })
    const isDragging = ref(false)
    const dragStartX = ref(0)
    const bucketStartX = ref(0)
    
    // Таймеры
    let countdownTimer = null
    let gameTimer = null
    let itemTimer = null
    let gameLoop = null
    
    // Конфигурация
    const itemTypes = [
      { type: 'apple', icon: '🍎', value: 10 },
      { type: 'star', icon: '⭐', value: 20 },
      { type: 'bomb', icon: '💣', value: -15 }
    ]
    
    // Компьютеды
    const timePercent = computed(() => (time.value / 60) * 100)
    
    // ========================
    // ОСНОВНЫЕ МЕТОДЫ
    // ========================
    
    // Инициализация пользователя
    const initUser = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()
        
        const user = tg.initDataUnsafe?.user
        if (user) {
          userData.value = {
            id: user.id.toString(),
            username: user.username || `user_${user.id}`,
            firstName: user.first_name || 'Player'
          }
        }
      } else {
        userData.value = { id: `dev_${Date.now()}`, username: 'DevUser', firstName: 'Developer' }
      }
    }
    
    // Инициализация игры
    const initGame = () => {
      const width = window.innerWidth
      bucketPosition.value = Math.max(0, (width - 80) / 2)
    }
    
    // Обратный отсчет
    const startCountdown = () => {
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
          showCountdown.value = false
          startGame()
        }
      }, 1000)
    }
    
    // Начало игры
    const startGame = () => {
      loadBestScore()
      
      time.value = 60
      score.value = 0
      gameOver.value = false
      isPlaying.value = true
      isNewRecord.value = false
      items.value = []
      
      // Позиция ведра
      initGame()
      
      // Таймер игры
      gameTimer = setInterval(() => {
        time.value--
        if (time.value <= 0) endGame()
      }, 1000)
      
      // Генерация предметов
      itemTimer = setInterval(createItem, 800)
      
      // Игровой цикл
      gameLoop = setInterval(updateGame, 16)
    }
    
    // Создание предмета
    const createItem = () => {
      if (!isPlaying.value || gameOver.value) return
      
      const type = itemTypes[Math.floor(Math.random() * itemTypes.length)]
      const width = window.innerWidth
      
      items.value.push({
        id: Date.now() + Math.random(),
        type: type.type,
        icon: type.icon,
        value: type.value,
        x: Math.random() * (width - 60),
        y: -60,
        speed: 2 + Math.random() * 2
      })
    }
    
    // Обновление игры
    const updateGame = () => {
      if (!isPlaying.value || gameOver.value) return
      
      const screenHeight = window.innerHeight
      const updatedItems = []
      
      for (const item of items.value) {
        item.y += item.speed
        
        // Столкновение
        if (item.y > screenHeight - 150) {
          const bucketLeft = bucketPosition.value
          const bucketRight = bucketPosition.value + 80
          const itemLeft = item.x
          const itemRight = item.x + 60
          
          if (itemLeft < bucketRight && itemRight > bucketLeft) {
            score.value += item.value
            continue
          }
        }
        
        if (item.y < screenHeight + 100) updatedItems.push(item)
      }
      
      items.value = updatedItems
    }
    
    // Конец игры
    const endGame = () => {
      gameOver.value = true
      isPlaying.value = false
      
      clearInterval(gameTimer)
      clearInterval(itemTimer)
      clearInterval(gameLoop)
      
      if (score.value > bestScore.value) {
        isNewRecord.value = true
        bestScore.value = score.value
        saveScore()
      }
      
      // Локальное сохранение
      localStorage.setItem('catch_game_best_score', bestScore.value.toString())
    }
    
    // Перезапуск
    const restartGame = () => {
      clearAllTimers()
      gameOver.value = false
      items.value = []
      isNewRecord.value = false
      countdown.value = 5
      showCountdown.value = true
      startCountdown()
    }
    
    // Очистка таймеров
    const clearAllTimers = () => {
      if (countdownTimer) clearInterval(countdownTimer)
      if (gameTimer) clearInterval(gameTimer)
      if (itemTimer) clearInterval(itemTimer)
      if (gameLoop) clearInterval(gameLoop)
    }
    
    // ========================
    // УПРАВЛЕНИЕ
    // ========================
    
    const handleMouseDown = (e) => {
      if (!isPlaying.value) return
      e.preventDefault()
      isDragging.value = true
      dragStartX.value = e.clientX
      bucketStartX.value = bucketPosition.value
    }
    
    const handleMouseMove = (e) => {
      if (!isPlaying.value || !isDragging.value) return
      e.preventDefault()
      
      const dragX = e.clientX
      const deltaX = dragX - dragStartX.value
      const width = window.innerWidth
      
      let newPos = bucketStartX.value + deltaX
      newPos = Math.max(0, Math.min(width - 80, newPos))
      
      bucketPosition.value = newPos
    }
    
    const handleMouseUp = () => isDragging.value = false
    
    const handleTouchStart = (e) => {
      if (!isPlaying.value) return
      e.preventDefault()
      isDragging.value = true
      dragStartX.value = e.touches[0].clientX
      bucketStartX.value = bucketPosition.value
    }
    
    const handleTouchMove = (e) => {
      if (!isPlaying.value || !isDragging.value) return
      e.preventDefault()
      
      const dragX = e.touches[0].clientX
      const deltaX = dragX - dragStartX.value
      const width = window.innerWidth
      
      let newPos = bucketStartX.value + deltaX
      newPos = Math.max(0, Math.min(width - 80, newPos))
      
      bucketPosition.value = newPos
    }
    
    const handleTouchEnd = () => isDragging.value = false
    
    // ========================
    // FIREBASE (УПРОЩЕННАЯ ВЕРСИЯ)
    // ========================
    
    // Загрузка лучшего счета
    const loadBestScore = () => {
      try {
        const saved = localStorage.getItem('catch_game_best_score')
        if (saved) bestScore.value = parseInt(saved) || 0
        
        // Firebase попробуем, но не будем на него полагаться
        if (userData.value.id) {
          setTimeout(() => tryLoadFromFirebase(), 100)
        }
      } catch (error) {
        console.log('Loading from localStorage only')
      }
    }
    
    // Попытка загрузки из Firebase
    const tryLoadFromFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig)
        const db = getFirestore(app)
        
        const docRef = doc(db, 'scores', userData.value.id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.score > bestScore.value) {
            bestScore.value = data.score
          }
        }
      } catch (error) {
        // Игнорируем ошибки Firebase
      }
    }
    
    // Сохранение счета
    const saveScore = () => {
      // Всегда сохраняем локально
      localStorage.setItem('catch_game_best_score', bestScore.value.toString())
      
      // Пробуем сохранить в Firebase в фоне
      if (userData.value.id) {
        setTimeout(() => trySaveToFirebase(), 100)
      }
    }
    
    // Попытка сохранения в Firebase
    const trySaveToFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig)
        const db = getFirestore(app)
        
        const scoreData = {
          score: bestScore.value,
          username: userData.value.username,
          firstName: userData.value.firstName,
          timestamp: Date.now(),
          date: new Date().toISOString()
        }
        
        // Сохраняем для пользователя
        const userDocRef = doc(db, 'scores', userData.value.id)
        await setDoc(userDocRef, scoreData, { merge: true })
        
        // Добавляем в лидерборд
        const leaderboardRef = doc(collection(db, 'leaderboard'))
        await setDoc(leaderboardRef, {
          ...scoreData,
          userId: userData.value.id
        })
      } catch (error) {
        // Игнорируем ошибки Firebase
      }
    }
    
    // ========================
    // ЖИЗНЕННЫЙ ЦИКЛ
    // ========================
    
    onMounted(() => {
      initUser()
      initGame()
      window.addEventListener('resize', initGame)
      
      setTimeout(() => {
        startCountdown()
      }, 1000)
    })
    
    onUnmounted(() => {
      clearAllTimers()
      window.removeEventListener('resize', initGame)
    })
    
    return {
      // Реактивные данные
      time, score, bestScore, gameOver, isPlaying,
      showCountdown, countdown, isNewRecord, timePercent,
      bucketPosition, items, userData,
      
      // Методы
      restartGame,
      handleMouseDown, handleMouseMove, handleMouseUp,
      handleTouchStart, handleTouchMove, handleTouchEnd
    }
  }
}
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
}

/* Обратный отсчет */
.countdown {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.countdown-number {
  font-size: 120px;
  font-weight: bold;
  color: #ff4500;
  text-shadow: 0 0 30px rgba(255, 69, 0, 0.8);
  animation: pulse 1s infinite;
  margin-bottom: 20px;
}

.countdown-text {
  font-size: 32px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  letter-spacing: 3px;
}

/* Игровой интерфейс */
.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}

/* Прогресс-бар времени */
.time-bar-container {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.time-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff4500, #ff8c00);
  border-radius: 10px;
  transition: width 1s linear;
  position: relative;
}

.time-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.2) 0%, 
    rgba(255,255,255,0) 50%, 
    rgba(255,255,255,0.2) 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.time-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* Отображение счета */
.score-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.score {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 15px rgba(100, 255, 100, 0.8);
}

.best-score {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* Игровое поле */
.game-area {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* Предметы */
.item {
  position: absolute;
  width: 60px;
  height: 60px;
  font-size: 40px;
  text-align: center;
  line-height: 60px;
  pointer-events: none;
  z-index: 2;
  user-select: none;
  will-change: transform;
}

.item.apple {
  animation: float 2s ease-in-out infinite;
}

.item.star {
  animation: spin 2s linear infinite, glow 1s alternate infinite;
}

.item.bomb {
  animation: shake 0.5s infinite;
}

/* Ведро */
.bucket {
  position: absolute;
  bottom: 100px;
  width: 80px;
  height: 80px;
  font-size: 60px;
  text-align: center;
  line-height: 80px;
  user-select: none;
  z-index: 5;
  cursor: pointer;
  filter: drop-shadow(0 5px 15px rgba(255, 165, 0, 0.5));
  transition: filter 0.2s;
  opacity: 0.8;
}

.bucket:active {
  filter: drop-shadow(0 5px 25px rgba(255, 165, 0, 0.8));
  opacity: 1;
}

/* Градиент */
.gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(to top, 
    rgba(255, 69, 0, 0.4) 0%, 
    rgba(255, 69, 0, 0.2) 50%, 
    transparent 100%);
  pointer-events: none;
  z-index: 1;
}

/* Результат */
.game-over {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.3s ease-out;
}

.game-over h2 {
  color: #fff;
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 0 0 20px #ff4500;
}

.final-score {
  color: #fff;
  font-size: 32px;
  margin: 10px 0;
  font-weight: bold;
}

.final-best {
  color: #ffd700;
  font-size: 24px;
  margin: 5px 0;
}

.new-record {
  color: #4dff88;
  font-size: 28px;
  font-weight: bold;
  margin: 15px 0;
  text-shadow: 0 0 10px rgba(77, 255, 136, 0.8);
  animation: glowText 1s infinite alternate;
}

.game-over button {
  margin-top: 30px;
  padding: 15px 40px;
  font-size: 20px;
  background: linear-gradient(to right, #ff4500, #ff8c00);
  color: #fff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 5px 15px rgba(255, 69, 0, 0.4);
}

.game-over button:hover {
  background: linear-gradient(to right, #ff5500, #ff9c00);
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 69, 0, 0.6);
}

.game-over button:active {
  transform: scale(0.95);
}

/* Анимации */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes glow {
  from { filter: drop-shadow(0 0 5px gold) brightness(1.2); }
  to { filter: drop-shadow(0 0 20px gold) brightness(1.5); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0px); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes glowText {
  from { text-shadow: 0 0 10px rgba(77, 255, 136, 0.8); }
  to { text-shadow: 0 0 20px rgba(77, 255, 136, 1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Адаптивность */
@media (max-width: 768px) {
  .countdown-number { font-size: 80px; }
  .countdown-text { font-size: 24px; }
  .score { font-size: 32px; }
  .best-score { font-size: 12px; }
  .bucket { width: 70px; height: 70px; font-size: 50px; line-height: 70px; bottom: 90px; }
  .item { width: 50px; height: 50px; font-size: 35px; line-height: 50px; }
  .game-over h2 { font-size: 36px; }
  .final-score { font-size: 28px; }
  .final-best { font-size: 20px; }
  .new-record { font-size: 22px; }
  .game-over button { padding: 12px 30px; font-size: 18px; }
}

@media (max-width: 480px) {
  .countdown-number { font-size: 60px; }
  .countdown-text { font-size: 18px; }
  .bucket { width: 60px; height: 60px; font-size: 45px; line-height: 60px; bottom: 80px; }
  .item { width: 45px; height: 45px; font-size: 30px; line-height: 45px; }
}
</style>
