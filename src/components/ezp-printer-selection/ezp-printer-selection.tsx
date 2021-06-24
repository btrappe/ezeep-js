import { Component, Host, Listen, Event, EventEmitter, State, h, Prop } from '@stencil/core'
import authStore from '../../services/auth'
import printStore, { EzpPrintService } from '../../services/print'
// import { PrintUserType } from '../../shared/types'

@Component({
  tag: 'ezp-printer-selection',
  styleUrl: 'ezp-printer-selection.scss',
  shadow: true,
})
export class EzpPrinterSelection {
  // private user: PrintUserType
  private options

  /**
   *
   * Properties
   *
   */
  @Prop() clientID: string
  @Prop() redirectURI: string
  @Prop() filename: string
  @Prop() fileurl: string
  @Prop() filetype: string
  /**
   *
   * States
   *
   */

  /** Description... */
  @State() showBackdrop: boolean = false
  @State() loading: boolean = true
  /**
   *
   * Events
   *
   */

  /** Description... */
  @Event() printCancel: EventEmitter<MouseEvent>

  /** Description... */
  @Event() printSubmit: EventEmitter<MouseEvent>

  /**
   *
   * Listeners
   *
   */

  @Listen('selectToggle')
  listenSelectExpand(event: CustomEvent) {
    this.showBackdrop = event.detail
  }

  /**
   *
   * Private methods
   *
   */

  /** Description... */
  private handleCancel = () => {
    this.printCancel.emit()
  }

  /** Description... */
  private handlePrint = () => {
    const printService = new EzpPrintService(this.redirectURI, this.clientID)
    printService.printFileByUrl(
      authStore.state.accessToken,
      this.fileurl,
      this.filetype,
      '867e37a5-336a-496c-b6e2-cb74b3eb32ea',
      this.filename);
    //this.printSubmit.emit()
  }

  logOut = () => {
    sessionStorage.clear()
    authStore.state.isAuthorized = false
    this.printCancel.emit()
  }

  /**
   *
   * Lifecycle methods
   *
   */

  /** Description... */
  async componentWillLoad() {
    this.loading = true
    await Promise.all([fetch('/data/user.json'), fetch('/data/options.json')])
      .then((responses) => Promise.all(responses.map((response) => response.json())))
      .then((data) => {
        // this.user = data[0]
        this.options = data[1]
      })
    const printService = new EzpPrintService(this.redirectURI, this.clientID)
    printService.getPrinterList(authStore.state.accessToken).finally(() => (this.loading = false))
    printService.getAllPrinterProperties(authStore.state.accessToken);
  }

  /**
   *
   * Render method
   *
   */

  render() {
    return this.loading ? (
      <ezp-progress status="Loading printers"></ezp-progress>
    ) : (
      <Host class={{ 'show-backdrop': this.showBackdrop }}>
        <div id="dialog">
          <div id="backdrop" />
          <div id="header">
            <ezp-typo-body weight="heavy">Print:</ezp-typo-body>
            <ezp-typo-body>{this.filename}</ezp-typo-body>
            <ezp-icon-button level="tertiary" icon="menu" id="toggle-menu" onClick={this.logOut} />
          </div>
          <div id="content">
            <div id="printer">
              <ezp-select
                label="Printer"
                icon="printer"
                placeholder="Select a printer"
                toggleFlow="vertical"
                optionFlow="vertical"
                options={printStore.state.printers.map((printer) => ({
                  id: printer.id,
                  title: printer.name,
                  meta: printer.location,
                }))}
              />
            </div>
            <div id="options">
              <ezp-select

                label="Color"
                placeholder="Select a color"
                toggleFlow="horizontal"
                optionFlow="horizontal"
                options={this.options.colors.map((color) => ({
                  id: color.id,
                  title: color.name,
                  meta: '',
                }))}
              />
              <ezp-select
                label="Orientation"
                placeholder="Select a orientation"
                toggleFlow="horizontal"
                optionFlow="horizontal"
                options={this.options.orientations.map((orientation) => ({
                  id: orientation.id,
                  title: orientation.name,
                  meta: '',
                }))}
              />
              <ezp-select
                label="Size"
                placeholder="Select a size"
                toggleFlow="horizontal"
                optionFlow="horizontal"
                options={this.options.sizes.map((size) => ({
                  id: size.id,
                  title: size.name,
                  meta: size.description,
                }))}
              />
            </div>
          </div>
          <div id="footer">
            <ezp-text-button type="button" level="secondary" onClick={this.handleCancel}>
              Cancel
            </ezp-text-button>
            <ezp-text-button type="button" onClick={this.handlePrint}>
              Print
            </ezp-text-button>
          </div>
          {/*<ejs-progress status="Printjob in progress" />*/}
        </div>
      </Host>
    )
  }
}
