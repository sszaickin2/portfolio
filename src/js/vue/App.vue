<script>
	import { createApp, ref } from "vue";

	// <div id="message">{{message}}</div>

	createApp({
		setup() {
			const message = ref("В комнату заходит VUE!");
			return { message };
		},
	}).mount("#message");
</script>
