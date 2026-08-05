<template>
  <q-page class="fullscreen">
    <!-- valid url -->
    <div v-if="validatedUrl">
      <MediaDisplayComponent :url="validatedUrl"></MediaDisplayComponent>
    </div>

    <!-- else: illegal url (other hostname or empty) -->
    <div v-else>
      <div class="fullscreen text-center q-pa-md flex flex-center">
        <div style="opacity: 0.5">
          <div style="font-size: 100px">:|</div>
          <div class="text-h3">{{ $t('Oops. That did not work out well...') }}</div>
          <div class="text-h5">{{ $t('If you think this is wrong, try again.') }}</div>
          <div class="q-mt-md">
            <!-- illegal url failed but props.url not empty (means url is absolute but different host - not allowed!)-->
            <div v-if="!props.url">
              {{ $t('No URL given to display item for download. You need to add ?url=/my/url/to/img.jpg to the address.') }}
            </div>

            <!-- validation failed but props.url not empty (means url is absolute but different host - not allowed!)-->
            <div v-else>
              {{ $t('For security reasons, the requested URL needs to be on the same host!') }}
              <br />
              {{
                $t('The requested URL ({requestedUrl}) must be relative or absolute but same hostname as this page ({requiredUrl}).', {
                  requestedUrl: props.url ? props.url : '- - (empty) - -',
                  requiredUrl: windowLocationHostname,
                })
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MediaDisplayComponent from '@/components/MediaDisplayComponent.vue'

const windowLocationHostname = window.location.hostname
interface Props {
  url: string | null
}

const props = withDefaults(defineProps<Props>(), {
  url: null,
})

const validatedUrl = computed<URL | null>(() => {
  if (props.url) {
    try {
      const decodedUri = decodeURIComponent(props.url)
      const givenUrl = new URL(decodedUri, window.location.href) //https://nodejs.org/api/url.html#the-whatwg-url-api
      console.log(`props.url=${props.url}, decodedUri=${decodedUri}, givenUrl=${givenUrl.toString()}`)
      // givenUrl is the parsed prop.url if absolute (base is ignored in this case.)
      // for relative props.url, the current window location is added.
      // means in the result, when comparing the hostname of window.location and givenUrl, if different its not local and then rejected.

      // in dev mode we want to test also on different hosts, browser might need cors everywhere plugin for hasslefree testing.
      if (import.meta.env.QUASAR_DEV) {
        return givenUrl
      }

      // in PROD env check for correct hostname and return only if check passes
      if (givenUrl.hostname === window.location.hostname) {
        return givenUrl
      }
    } catch (e) {
      console.warn(e)
    }
  }

  // catch all
  return null
})
</script>
