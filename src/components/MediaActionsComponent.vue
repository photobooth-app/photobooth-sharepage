<template>
  <div class="button-container q-gutter-x-md">
    <q-btn class="btn-download" :icon="mdiDownload" color="primary" size="md" @click="doDownload" :label="$t('Download')" no-caps stack />
    <q-btn v-if="isShareAvailable" size="md" class="btn-share" :icon="mdiShare" @click="doShare" color="primary" :label="$t('Share')" no-caps stack />
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n'
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { mimeToExtension } from '@/models/types'
import { mdiShare } from '@quasar/extras/mdi-v7' //direct imports of icons instead embedding the whole font file
import { mdiDownload } from '@quasar/extras/mdi-v7' //direct imports of icons instead embedding the whole font file
import { useQuasar } from 'quasar'
const $q = useQuasar()
const { t } = useI18n()

interface Props {
  url: URL
}

const props = withDefaults(defineProps<Props>(), {
  // url: () => ""
})

const isShareAvailable = computed(() => {
  return window.location.protocol === 'https:' && typeof navigator !== 'undefined' && typeof navigator.share === 'function'
})

function getExtensionFromContentType(contentType: string | null) {
  if (!contentType) return null
  return mimeToExtension[contentType.toLowerCase()] || null
}

async function loadFile() {
  // load the file (again) with the fetch api when the buttons are clicked.

  // implement proper caching on server side so the client can just refetch
  // the image from internal cache instead loading from the server again
  const response = await fetch(props.url)
  const blob = await response.blob()
  const contentType = blob.type || null
  const fileextensionDerivedFromContentType = getExtensionFromContentType(contentType)

  if (!fileextensionDerivedFromContentType) {
    throw new Error('cannot determine file type by http headers content-type. it is mandatory to use a server providing these information')
  }

  const outFilename = `download.${fileextensionDerivedFromContentType}`

  console.log(
    'media file stats:',
    `props.url=${props.url}`,
    `fileextensionDerivedFromContentType=${fileextensionDerivedFromContentType}`,
    `contentType=${contentType}`,
    `outFilename=${outFilename}`
  )

  return new File([blob], outFilename, { type: contentType || 'application/octet-stream' })
}
async function doDownload() {
  $q.notify({
    message: t('Download started. Please wait until it finishes.'),
  })
  try {
    const file = await loadFile()

    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = file.name
    link.click()
    link.remove() // Clean up
  } catch (error) {
    console.error(error)
    $q.notify({
      message: t('Could not download the file. Please try again.'),
      caption: t('Error'),
      color: 'negative',
    })
  }
}
async function doShare() {
  let file
  if (window.location.protocol != 'https:') {
    $q.notify({
      message: t('The share functionality is only allowed for encrypted HTTPS hosts.'),
      caption: t('Error'),
      color: 'negative',
    })
    return
  }
  if (!navigator.share) {
    $q.notify({
      message: t('The share functionality is not supported by your browser.'),
      caption: t('Error'),
      color: 'negative',
    })
    return
  }

  try {
    file = await loadFile()
  } catch (error) {
    console.error(error)
    $q.notify({
      message: t('Could not download the file. Please try again.'),
      caption: t('Error'),
      color: 'negative',
    })
    return
  }

  const shareFile = {
    files: [file],
    title: 'Your photobooth shot',
    text: 'Check out this shot I took!',
  }
  const shareUrl = {
    url: props.url.toString(),
    title: 'Your photobooth shot',
    text: 'Check out this shot I took!',
  }

  if (navigator.canShare(shareFile)) {
    navigator
      .share(shareFile)
      .then(() => console.log('success'))
      .catch(error => {
        // error is also if user aborts the process, so we just log to console but fail silently
        console.log('failed', error)
      })
  } else if (navigator.canShare(shareUrl)) {
    // Fallback to sharing without file (link only)
    navigator
      .share()
      .then(() => console.log('success'))
      .catch(error => {
        // error is also if user aborts the process, so we just log to console but fail silently
        console.log('failed', error)
      })
  } else {
    $q.notify({
      message: t('This device does not support sharing files.'),
      caption: t('Error'),
      color: 'negative',
    })
  }
}
</script>
