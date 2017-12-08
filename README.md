# asafagranat.com

Asaf Agranat's pages on Github

```html
<div class="padding-large">
    <h2>Views</h2>
    <div layout="row" layout-wrap>
    <md-card ng-repeat="view in vm.links.views" class="default-card">
        <a ng-link="['{{view.url}}']">{{view.name}}</a>
    </md-card>
    </div>
</div>
```
