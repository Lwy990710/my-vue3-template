<template>
  <div class="main">
    <div class="swiperbox">
      <swiper
        :slides-per-view="1"
        :space-between="0"
        :loop="true"
        :speed="1000"
        :centered-slides="true"
        :pagination="{
          clickable: true
        }"
        :autoplay="{
          delay: 3000,
          disableOnInteraction: false
        }"
        :navigation="true"
        :modules="modules"
        class="mySwiper"
      >
        <swiper-slide>
          <div
            class="slide-image page1"
          />
        </swiper-slide>
        <swiper-slide>
          <div
            class="slide-image page2"
          />
        </swiper-slide>
        <swiper-slide>
          <div
            class="slide-image page3"
          />
        </swiper-slide>
        <swiper-slide>
          <div
            class="slide-image page4"
          />
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination, A11y } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
const modules = [Autoplay, Pagination, Navigation, A11y]
</script>

<style lang="less" scoped>
.main {
 background: rgb(246, 246, 246);
}
.slide-image{
  background-size: 100% 100%;
  color: #fff;
  font-size: 100px;
  font-weight: 900;
  text-align: center;
  line-height: 600px;
  width:81%;
  height: 600px;
}

:deep(.swiper-button-prev,.swiper-button-next){
  color: #182c7d;
}
:deep(.swiper-pagination-bullet) {
  margin: 0 20px !important;
	width: 14px;
	height: 14px;
	background-color: #182c7d;
}
:deep(.swiper-pagination){
  width:80% !important;
  margin-bottom: 50px !important;
}
.page1{
  background-image: url('../../../../../public/assets/images/home/page1.png')
}
.page2{
  background-image: url('../../../../../public/assets/images/home/page2.png')
}

.page3{
  background-image: url('../../../../../public/assets/images/home/page1.png')
}
.page4{
  background-image: url('../../../../../public/assets/images/home/page2.png')
}
</style>
