<template>
  <div id="media-container">
    <!-- LOADING SKELETON -->
    <transition v-if="!loadingDone" appear enter-active-class="animated fadeIn">
      <div class="flex flex-center column q-gutter-y-lg">
        <q-skeleton height="400px" width="600px" class="media-content" />
        <div class="absolute flex flex-center column q-gutter-y-lg">
          <div>{{ $t('Loading your file. Please wait.') }}</div>
        </div>
      </div>
    </transition>

    <!-- IMAGE -->
    <transition v-if="props.mediaType === MediaTypes.image" appear enter-active-class="animated fadeIn">
      <img
        v-show="loadingDone"
        :src="props.url.toString()"
        id="img-media-content"
        class="media-content"
        @error="onMediaContentLoadingErrored"
        @load="onMediaContentLoadingFinished"
      />
    </transition>

    <!-- VIDEO-->
    <transition v-else-if="props.mediaType === MediaTypes.video" appear enter-active-class="animated fadeIn">
      <video
        v-show="loadingDone"
        :src="props.url.toString()"
        class="media-content"
        muted
        autoplay
        loop
        playsinline
        controls
        controlslist="noremoteplayback noplaybackrate"
        disablepictureinpicture
        @error="onMediaContentLoadingErrored"
        @loadeddata="onMediaContentLoadingFinished"
      ></video>
    </transition>

    <!-- UNSUPPORTED FILE TYPE! -->
    <div v-else>unknown file type, not supported</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MediaTypes } from '@/models/types'

interface Props {
  url: URL
  mediaType: MediaTypes
}

const props = withDefaults(defineProps<Props>(), {
  // url: () => ""
  // mediaType: () => ""
})

const loadingDone = ref(false)

function onMediaContentLoadingFinished() {
  console.log('finished')
  loadingDone.value = true
}
function onMediaContentLoadingErrored() {
  console.log('errored')
}
</script>

<style lang="css">
#img-media-content {
  /* border-radius: 10px; */
}
#video-media-content {
  /*TODO*/
}
#media-container {
  height: 100%;
}
.media-content {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}
</style>
