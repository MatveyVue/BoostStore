<template>
<div class="back">
<RouterLink style="text-decoration: none; color: white;" to="/">
    <h1 class="addboost">Withdrawal</h1>
</RouterLink>

<div style="margin-top: 40px;">
<p class="intinfo">Username</p>
<input class="addint" placeholder=" Your Username">
<p class="intinfo">Quantity Stars</p>
<input class="addint" placeholder=" Quantity">
</div>
<RouterLink style="text-decoration: none; color: white;" to="/">
    <button class="pay">Withdrawal</button>
</RouterLink>
</div>
</template>

<style scoped>
.back {
    border-radius: 0;
    height: 120%;
    margin-top: -115px;
}
</style>