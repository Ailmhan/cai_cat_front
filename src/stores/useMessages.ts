import type { MessagesState } from '@stores/types'
import type { BotMessage, UserMessage } from '@models/Message'
import { now, uniqueId } from 'lodash'
import { useNotifications } from '@stores/useNotifications'
import { apiClient } from '@/api'
import { useSettings } from '@stores/useSettings'
import MemoryService from '@services/MemoryService'

export const useMessages = defineStore('messages', () => {
	const currentState = reactive<MessagesState>({
		ready: false,
		loading: false,
		messages: [],
		tokens: [],
		defaultMessages: [
			'How does CAI solve concierge service accessibility for individual entrepreneurs in B2C?',
			'How does CAI address the lack of digital services in concierge services for B2B clients?',
			'What unique benefits does CAI offer to business owners?',
			'How does CAI support solo entrepreneurs with personalized assistance?',
			'Which languages does CAI support for a globally inclusive user experience?',
			'What advantages does CAI bring to the concierge sector based on its experience with various entities?',
			'How does CAI use its proprietary data to stay competitive?',
			"What new features are in CAI's future development plans?",
			'Find a hotel in Dubai with CAI.',
		],
	})

	const { state: history } = useAsyncState(MemoryService.getConversation, [])

	watchEffect(() => {
		history.value.forEach(({ who, message, why }) => {
			addMessage({
				text: message,
				timestamp: now(),
				sender: who == 'AI' ? 'bot' : 'user',
				why,
			})
		})
		currentState.loading = false
	})

	const { isReadyAndAuth } = storeToRefs(useSettings())
	const { showNotification } = useNotifications()

	watchEffect(() => {
		/**
		 * Subscribes to the messages service on component mount
		 * and dispatches the received messages to the store.
		 * It also dispatches the error to the store if an error occurs.
		 */
		currentState.loading = !isReadyAndAuth.value
		currentState.ready = isReadyAndAuth.value

		apiClient
			.onConnected(() => {
				currentState.ready = true
			})
			.onMessage(({ content, type, why }) => {
				switch (type) {
					case 'chat_token':
						currentState.tokens.push(content)
						break
					case 'chat':
						currentState.tokens = []
						addMessage({
							text: content,
							sender: 'bot',
							timestamp: now(),
							why,
						})
						break
					case 'notification':
						showNotification({
							type: 'info',
							text: content,
						})
						break
					default:
						break
				}
			})
			.onError(error => {
				currentState.loading = currentState.ready = false
				currentState.error = error.description
			})
			.onDisconnected(() => {
				currentState.ready = false
			})
	})

	tryOnUnmounted(() => {
		/**
		 * Unsubscribes to the messages service on component unmount
		 */
		apiClient.close()
	})

	/**
	 * Adds a message to the list of messages
	 */
	const addMessage = (message: Omit<BotMessage, 'id'> | Omit<UserMessage, 'id'>) => {
		currentState.error = undefined
		const msg = {
			id: uniqueId('m_'),
			...message,
		}
		currentState.messages.push(msg)
		if (!(message as UserMessage)?.file) currentState.loading = msg.sender === 'user'
	}

	/**
	 * Selects 5 random default messages from the messages slice.
	 */
	const selectRandomDefaultMessages = () => {
		const messages = [...currentState.defaultMessages]
		const shuffled = messages.sort(() => 0.5 - Math.random())
		return shuffled.slice(0, 5)
	}

	/**
	 * Sends a message to the messages service and dispatches it to the store
	 */
	const dispatchMessage = (message: string | File) => {
		if (typeof message === 'string') {
			apiClient.send(message)
			addMessage({
				text: message.trim(),
				timestamp: now(),
				sender: 'user',
			})
		} else {
			addMessage({
				text: '',
				timestamp: now(),
				sender: 'user',
				file: message,
			})
		}
	}

	return {
		currentState,
		addMessage,
		selectRandomDefaultMessages,
		dispatchMessage,
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMessages, import.meta.hot))
}
