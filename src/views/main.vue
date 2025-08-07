<template>
<div class="balance">
    <h1 class="stars">0.00</h1>
<div class="btn">
    <RouterLink tyle="text-decoration: none; color: black;" to="withdrawal">
        <button class="with">
            <img class="proficon" src="../components/withdrawal.png">
            <p class="txtbtn">Withdrawal</p>
        </button>
    </RouterLink>
    <RouterLink tyle="text-decoration: none; color: black;" to="profile">
        <button class="profile">
            <img class="proficon" src="../components/user.png">
            <p class="txtbtn">Profile</p>
        </button>
    </RouterLink>
    <RouterLink style="text-decoration: none; color: black;"  to="add">
        <button class="add">
            <img class="proficon" src="../components/add.png">
            <p class="txtbtn">Add Boost</p>
        </button>
    </RouterLink>
</div>
</div>

<div class="back">
    <p class="active">Active Boost</p>
    <div class="channel">
        <img style="border-radius: 25px; margin-top: 10px; margin-left: 10px;" width="50px" src="../components/cmd69.jpg">
        <p class="cht">$CMD69</p>
        <p class="boost">50<img style="margin-left: 25px;" class="boosticon" src="../components/Boost.PNG">/40</p>
    <a style="text-decoration: none; color: white;" href="https://t.me/TETDRAIN?boost">
        <button class="boostbtn">Boost</button>
    </a>
    </div>
</div>
</template>


<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>