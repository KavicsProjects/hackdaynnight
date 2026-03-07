<!-- Gemini generated the code -->

<template>
  <div style="padding: 50px; text-align: center; font-family: sans-serif; background-color: #f4f7f6; min-height: 100vh;">
    <div style="background: white; padding: 40px; border-radius: 20px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      
      <h1 style="color: #2c3e50; margin-bottom: 10px;">Dinamikus QR Kód</h1>

      <div style="background: #fff; padding: 15px; border: 1px solid #eee; border-radius: 12px; display: inline-block;">
        <img 
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fixLink)}`" 
          alt="QR Kód"
          style="display: block; width: 250px; height: 250px;"
        />
      </div>

      <div style="margin-top: 30px;">
        <NuxtLink to="/" style="color: #00dc82; text-decoration: none; font-weight: 600;">
          ← Vissza a kezdőlapra
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'


const fixLink = ref('https://en.wikipedia.org/wiki/Hide_the_Pain_Harold')      //right now an example link's given here, switch it to dinamic
</script>