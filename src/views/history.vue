<template>
<div class="balance">
    <img class="profileicon" src="../components/cmd69.jpg">
<RouterLink style="text-decoration: none; color: white;" to="/">
    <h1 class="user">{{ user }}</h1>
</RouterLink>
</div>
<div class="back">
<RouterLink style="text-decoration: none; color: white;" to="profile">
    <p class="active">Active</p>
</RouterLink>
<p class="history"><b>History</b> </p>
<div class="channel">
        <img style="border-radius: 25px; margin-top: 10px; margin-left: 10px;" width="50px" src="../components/cmd69.jpg">
        <p class="cht">$CMD69</p>
        <p class="boost">50<img style="margin-left: 25px;" class="boosticon" src="../components/Boost.PNG">/5</p>
</div>
</div>
</template>

<style scoped>
.boost {
    position: absolute;
    margin-left: 75%;
    white-space: nowrap;
}
</style>

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