/**
 * Luecken der Testumgebung schliessen.
 *
 * jsdom ist kein Browser. Es bildet das DOM sehr weitgehend nach, aber nicht
 * vollstaendig - `<dialog>` gehoert zu den Luecken: `showModal()` und `close()`
 * existieren schlicht nicht (Stand jsdom 29).
 *
 * Wichtig ist, WO man so etwas repariert: hier, in der Testumgebung. Die
 * Komponente selbst bekommt keine Sonderbehandlung - sonst traegt der
 * Produktionscode Ballast fuer ein Problem, das nur im Test existiert.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement, returnValue?: string) {
    this.open = false
    if (returnValue !== undefined) this.returnValue = returnValue
    // Das echte <dialog> feuert `close`. Ohne dieses Ereignis liesse sich
    // nicht testen, dass die Komponente den Zustand zurueckmeldet.
    this.dispatchEvent(new Event('close'))
  }
}
