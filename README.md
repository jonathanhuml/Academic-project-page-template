# CASSM Project Page

Static project page for:

**Computation-Aware Kalman Filtering with Model Selection for Neural Dynamics**

JR Huml, Jonathan Wenger, John P. Cunningham

Accepted to ProbNum 2026: The 2nd International Conference on Probabilistic Numerics

Links:

- Paper: https://arxiv.org/abs/2606.01468
- Code: https://github.com/jonathanhuml/cassm
- Conference: https://probnum2026.github.io/

## Local Preview

Open `index.html` directly in a browser. The page is static and does not require a build step.

## Custom Domain

This repo includes a `CNAME` file with:

```text
cassm-torch.com
```

Configure GitHub Pages for this project repository, not the `jonathanhuml.github.io` repository. Keeping the custom domain on this repo will not replace or delete the existing homepage at `jonathanhuml.github.io`.

For the apex domain, configure the Pages custom domain as:

```text
cassm-torch.com
```

At the DNS provider, add these GitHub Pages apex `A` records for `cassm-torch.com`:

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

Optionally, add a `www` CNAME record that points to:

```text
www  CNAME  jonathanhuml.github.io
```

If the domain still has a "Squarespace Defaults" preset, remove that preset first. In particular, do not keep the Squarespace `A` records pointing to `198.49.23.145`, `198.185.159.144`, `198.185.159.145`, or `198.49.23.144`, and do not keep `www` pointed at `ext-sq.squarespace.com`.

Then enable "Enforce HTTPS" in the Pages settings after GitHub provisions the certificate. If GitHub warns that the domain is already configured elsewhere, remove it from the other repo before adding it here.

## Files

- `index.html`: page content, paper metadata, and citation
- `static/css/index.css`: page layout and visual design
- `static/js/index.js`: copy button, scroll button, and Lorenz animation
- `static/images/columbia-logo.png`: source logo for generated favicon assets
- `static/images/favicon.png`, `static/images/favicon.ico`, `static/images/apple-touch-icon.png`: browser icons generated from the logo
- `static/images/lorenz_dynamics.png`: local visual fallback/social asset
- `static/images/social_preview.png`: 1200x630 Open Graph/Twitter preview
- `scripts/generate_social_preview.py`: reproducible preview image generator
- `scripts/generate_favicon.py`: reproducible favicon generator
- `CNAME`: proposed GitHub Pages custom domain

## Acknowledgments

This page was adapted from the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template), which was adopted from the [Nerfies](https://nerfies.github.io/) project page.

## Website License

The page source inherits the template license: [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).
