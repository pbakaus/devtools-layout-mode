# Layout Mode. Yeah baby.
Layout Mode ftw! This is an experiment.

## The bookmarklet

Use this bookmarklet and profit. Change the URL to one on your localhost once you checked out a copy.

```
javascript:(function()%7Bfunction callback()%7Bvoid(0)%7Dvar s%3Ddocument.createElement("script")%3Bs.src%3D"https%3A%2F%2Fpaulbakaus.com%2Flabs%2Flayoutmode%2Fjs%2Fbookmarklet.js"%3Bif(s.addEventListener)%7Bs.addEventListener("load"%2Ccallback%2Cfalse)%7Delse if(s.readyState)%7Bs.onreadystatechange%3Dcallback%7Ddocument.body.appendChild(s)%3B%7D)()
```
