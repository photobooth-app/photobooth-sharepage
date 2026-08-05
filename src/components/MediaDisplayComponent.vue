<template>
  <!-- <div style="position: absolute; top: 10px; left: 10px">{{ mediaType }} {{ mediaStatus }}</div> -->

  <!-- INIT: all on start (or prop.url changed) -->
  <div v-if="mediaStatus == MediaStatus.init">
    <div class="absolute-full flex flex-center column q-gutter-y-lg">
      <div>
        <q-spinner size="6em" color="primary" />
      </div>
      <div>{{ $t('Checking the files availability. Please wait.') }}</div>
    </div>
  </div>

  <!-- UNAVAILABLE: preflight check result is negative, likely the file is not found on server -->
  <div v-else-if="mediaStatus == MediaStatus.unavailable">
    <div class="absolute-full flex flex-center column">
      <div class="text-h5">
        {{ $t('Failed to load the file.') }}
      </div>
      <div>
        {{ $t('Refresh the page to try again.') }}
      </div>
      <div class="q-mt-lg">
        <q-btn :label="$t('Refresh')" color="primary" @click="reloadPage" />
      </div>
    </div>
  </div>

  <!-- DISPLAY MEDIA -->
  <div v-else-if="mediaStatus == MediaStatus.display && mediaType != MediaTypes.unknown">
    <div class="absolute-full full-height column items-center no-wrap q-pa-md">
      <!-- CAPTION -->
      <div class="text-h5">
        {{ $t('Download or share with others:') }}
      </div>

      <!-- MEDIA -->
      <div class="col-shrink q-pa-md">
        <MediaPlayerComponent :url="props.url" :mediaType="mediaType"></MediaPlayerComponent>
      </div>

      <!-- ACTIONS-->
      <MediaActionsComponent :url="props.url"></MediaActionsComponent>
    </div>
  </div>

  <!-- UNKNOWN STATUS: due to enum this cannot happen actually... -->
  <div v-else>
    <div class="absolute-full flex flex-center">cannot display media (mediaStatus {{ mediaStatus }}, mediaType {{ mediaType }})</div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import { MediaStatus, MediaTypes } from '@/models/types'
import MediaPlayerComponent from './MediaPlayerComponent.vue'
import MediaActionsComponent from './MediaActionsComponent.vue'
interface Props {
  url: URL
}

const props = withDefaults(defineProps<Props>(), {
  // todos: () => []
})

const mediaStatus = ref<MediaStatus>(MediaStatus.init)
const mediaType = ref<MediaTypes>(MediaTypes.unknown)

const reloadPage = () => {
  window.location.reload()
}
async function detectMediaType(url: URL) {
  //reset on any change of url before checks
  mediaStatus.value = MediaStatus.init
  mediaType.value = MediaTypes.unknown

  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('Content-Type')

    // first check if request is ok so avail/no avail can be set.
    if (!response.ok) {
      console.warn('preflight check for item availability failed:', response)

      mediaStatus.value = MediaStatus.unavailable
      return
    }

    if (contentType?.startsWith('image/')) {
      mediaType.value = MediaTypes.image
    } else if (contentType?.startsWith('video/')) {
      mediaType.value = MediaTypes.video
    } else {
      mediaType.value = MediaTypes.unknown
    }
    mediaStatus.value = MediaStatus.display
  } catch (error) {
    console.error('Error preflight media checking:', error)

    mediaStatus.value = MediaStatus.unavailable
  }
}

async function onUrlInitChanged() {
  await detectMediaType(props.url)
}

watch(
  () => props.url,
  async (newVal, oldVal) => {
    console.log('url changed from', oldVal, 'to', newVal)
    await onUrlInitChanged()
  }
)

onMounted(() => {
  void onUrlInitChanged() // void since we do not want to wait for the mediatype detection. for api.php it can take some time and nothing is rendered.
})
</script>
