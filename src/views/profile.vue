<template>
<div class="balance">
    <img class="profileicon" src="../components/cmd69.jpg">
<RouterLink style="text-decoration: none; color: black;" to="/">
    <h1 class="user">{{ user }}</h1>
</RouterLink>
</div>
<div class="back">
<p class="active"><b>Active</b></p>
<RouterLink style="text-decoration: none; color: black;" to="history">
    <p class="history">History</p>
</RouterLink>
<div class="channel">
        <img style="border-radius: 25px; margin-top: 10px; margin-left: 10px;" width="50px" src="../components/cmd69.jpg">
        <p class="cht">$CMD69</p>
        <p class="boost">50<img style="margin-left: 25px;" class="boosticon" src="../components/Boost.PNG">/40</p>
        <button class="delete">Delete</button>
</div>
</div>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
    data() {
    return {
      user: window.Telegram.WebApp.initDataUnsafe.user ? window.Telegram.WebApp.initDataUnsafe.user.username : null,
    };
  },
};
</script>