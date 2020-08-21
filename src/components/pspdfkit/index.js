import React, {Component} from "react";
import PSPDFKitWeb from "pspdfkit";

export default class PSPDFKit extends Component {
    constructor(props, context) {
        super(props, context);
        this._instance = null;
        this._container = null;

        this.state = {
            text: '',
            speech: false
        };

        this.onRef = this.onRef.bind(this);
        this.load = this.load.bind(this);
        this.unload = this.unload.bind(this);
    }

    onRef(container) {
        this._container = container;
    }

    async load(props) {
        console.log(`Loading ${props.documentUrl}`);

        this._instance = await PSPDFKitWeb.load({
            document: props.documentUrl,
            container: this._container,
            licenseKey: props.licenseKey,
            baseUrl: props.baseUrl
        });

        const item = {
            type: "custom",
            id: "button-read-text",
            title: "Read",
            onPress: event => {
                const synth = window.speechSynthesis;
                const utterThis = new SpeechSynthesisUtterance(this.state.text);
                utterThis.lang = 'es-ES';
                synth.speak(utterThis);
            }
        };

        this._instance.setToolbarItems(items => {
            items.push(item);
            return items;
        });

        this._instance.addEventListener("textSelection.change", textSelection => {
            if (textSelection) {
                textSelection.getText().then(text => {
                    this.setState({
                        text: text
                    })
                });
            } else {
                console.log("no text is selected");
            }
        });

        console.log("Successfully mounted PSPDFKit", this._instance);
    }

    unload() {
        PSPDFKitWeb.unload(this._instance || this._container);
        this._instance = null;
    }

    componentDidMount() {
        this.load(this.props);
    }

    componentDidUpdate(prevProps) {
        const nextProps = this.props;
        // We only want to reload the document when the documentUrl prop changes.
        if (nextProps.documentUrl !== prevProps.documentUrl) {
            this.unload();
            this.load(nextProps);
        }
    }

    componentWillUnmount() {
        this.unload();
    }

    render() {
        return (
            <div
                ref={this.onRef}
                style={{width: "100%", height: "100%", position: "absolute"}}
            />
        );
    }
}
