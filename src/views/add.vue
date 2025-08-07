<template>
<div class="back">
<RouterLink style="text-decoration: none; color: white;" to="/">
    <h1 class="addboost">Add Boost</h1>
</RouterLink>

<div style="margin-top: 40px;">
<p class="intinfo">User Channel</p>
<input class="addint" placeholder=" User Your Channel">
<p class="intinfo">Quantity Boost</p>
<input class="addint" placeholder=" Quantity">
</div>
<RouterLink style="text-decoration: none; color: white;" to="/">
    <button class="pay">Add To 100 Stars</button>
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