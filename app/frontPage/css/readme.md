# FrontPage SCSS Overview

This folder contains a build script to compile the SCSS located in
`../webapp/Connector/frontPage/css/` into the final application.css file that
is used on the home page.

# Installation

Required: Ruby

1. Open CLI
2. `cd` into this directory. (`cds/app/frontPage/css`)
3. Install sass: `gem install sass`
4. Install **bourbon** into the css directory:
 
      	gem install bourbon
      	bourbon install

5. Install **neat** into the css directory:

		gem install neat
		neat install

6. You should now be able to compile the SCSS styles.


# Compiling SCSS

First, in a CLI, `cd` into this directory (`cds/app/frontPage/css`)

To compile the SCSS, run the following command:

	sass application.scss ../../../webapp/frontPage/css/application.css

This will generate a new `application.css` and `application.css.map` file in 
`webapp/frontPage/css/`.


If you're making a lot of changes, you may want sass to watch the files
and compile immediately when you've saved a change:

	sass --watch application.scss:../../../webapp/frontPage/css/application.css

