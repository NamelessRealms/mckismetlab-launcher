export default class Embed {

  private _title = "";
  private _description = "";
  private _color = "";
  private _author = {
    name: "",
    icon_url: ""
  }
  private _footer = {
    text: "",
    icon_url: ""
  }

  private _fields = new Array<{
    name: string,
    value: string,
    inline: boolean
  }>();

  public setFields(fieldsData: { name: string, value: string, inline?: boolean }) {
    this._fields.push({
      name: fieldsData.name,
      value: fieldsData.value,
      inline: fieldsData.inline || true
    });
  }

  public getFields(): Array<{ name: string, value: string, inline: boolean }> {
    return this._fields;
  }

  public set title(title: string) {
    this._title = title;
  }

  public get title() {
    return this._title;
  }

  public set description(description: string) {
    this._description = description;
  }

  public get description() {
    return this._description;
  }

  public set color(color: string) {
    this._color = color;
  }

  public get color() {
    return this._color;
  }

  public set authorName(name: string) {
    this._author.name = name;
  }

  public get authorName() {
    return this._author.name;
  }

  public set authorIconUrl(url: string) {
    this._author.icon_url = url;
  }

  public get authorIconUrl() {
    return this._author.icon_url;
  }

  public set footerText(text: string) {
    this._footer.text = text;
  }

  public get footerText() {
    return this._footer.text;
  }

  public set footerIconUrl(url: string) {
    this._footer.icon_url = url;
  }

  public get footerIconUrl() {
    return this._footer.icon_url;
  }
}
