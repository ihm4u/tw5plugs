DISTDIR=editions/tidgraph/plugins/tidgraph
SRCDIR=src/plugins/tidgraph
JSSRC = utils.js widget.js
SRC= plugin.info $(shell cd $(SRCDIR) > /dev/null && ls *.tid doc/*.tid)
TARGETS=$(addprefix $(DISTDIR)/,$(JSSRC) $(SRC))
PROD=yes
$(info $(SRC))

.PHONY: all clean serve

targets: $(TARGETS)


prod:
	if [ -L "$(DISTDIR)" ]; then \
	   echo "Deleting development link $(DISTDIR)"; \
		rm -f $(DISTDIR); \
		echo "Making $(DISTDIR)"; \
	fi
	mkdir -p "$(DISTDIR)" "$(DISTDIR)/doc"
	echo "Making production targets"
	PROD="yes" make targets
	echo `grep version $(DISTDIR)/plugin.info`" is it correct?"
	echo "Making index file"
	make index
	echo `grep \"version $(DISTDIR)/plugin.info`
	echo "done."


dev:
	if [ ! -L "$(DISTDIR)" ]; then \
	   echo "Deleting production $(DISTDIR)"; \
		rm -rf $(DISTDIR); \
		echo "Making symlink to $(SRCDIR)"; \
		ln -s `readlink -f $(SRCDIR)` $(DISTDIR); \
	fi
	bin/serve editions/tidgraph;
	while inotifywait -e move_self -e modify  $(DISTDIR)/utils.js; do \
		bin/serve -k; \
		echo "Building targets";  \
		make PROD="no" targets; \
		echo ""; \
		bin/serve editions/tidgraph; \
	done

serve:
	@-bin/serve -k
	bin/serve editions/tidgraph

clean:
	rm $(TARGETS)

index: unlink $(TARGETS)
	rm -rf editions/tidgraph-github/{plugins,tiddlers}
	cp -R editions/tidgraph/plugins editions/tidgraph-github/
	cp -R editions/tidgraph/tiddlers editions/tidgraph-github/
	tiddlywiki editions/tidgraph-github --build index
	cp editions/tidgraph-github/output/index.html index.html


unlink:
	if [ -L "$(DISTDIR)/utils.js" ]; then rm -f "$(DISTDIR)/utils.js"; fi

$(DISTDIR)/%.js: $(SRCDIR)/%.js
	if [ "$(PROD)" = "yes" ]; then \
		sed -ne '\#/\*\\#,\#\\\*/# p' "$^" > "$@" && \
		closure "$^" >> "$@"; \
	else \
	   cp "$^"  "$@"; \
	fi

$(DISTDIR)/plugin.info: $(SRCDIR)/plugin.info
	   cp "$^"  "$@";

$(DISTDIR)/%.tid: $(SRCDIR)/%.tid
	   cp "$^"  "$@";

$(DISTDIR)/doc/%.tid: $(SRCDIR)/doc/%.tid
	   cp "$^"  "$@";
