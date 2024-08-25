import {base} from '../../proxy_url'

export const backup = (setSuccessNotificationOpen) => {
    return fetch(`${base}/backup`).then(response => response.json()
        ).then(data => {
            if (data.status == "okay") {
                setSuccessNotificationOpen(true)
            }
        })
}